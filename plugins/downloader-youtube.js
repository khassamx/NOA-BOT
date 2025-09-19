import yts from 'yt-search'
import fetch from 'node-fetch'
import axios from 'axios'

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
const limitMB = 105

const handler = async (m, { conn, text, command, usedPrefix }) => {
  try {
    if (!text?.trim()) {
      return conn.sendMessage(m.chat, {
        text: `> ✩ Usa ${usedPrefix + command} <link o nombre del video>`
      }, { quoted: m })
    }

    
    const videoIdMatch = text.match(youtubeRegexID) || null
    let searchQuery = videoIdMatch ? 'https://youtu.be/' + videoIdMatch[1] : text
    let ytResult = await yts(searchQuery)

    if (videoIdMatch) {
      const videoId = videoIdMatch[1]
      ytResult = ytResult.all.find(item => item.videoId === videoId) || ytResult.videos.find(item => item.videoId === videoId)
    }

    ytResult = ytResult.all?.[0] || ytResult.videos?.[0] || ytResult
    if (!ytResult) return conn.sendMessage(m.chat, { text: `> ✩ No se encontraron resultados, para la búsqueda.` }, { quoted: m })

    let { title, thumbnail, timestamp, views, ago, url, author } = ytResult
    title = title || 'No encontrado'
    thumbnail = thumbnail || ''
    timestamp = timestamp || 'No disponible'
    views = views || 'No disponible'
    ago = ago || 'No disponible'
    url = url || ''
    author = author || { name: 'Desconocido' }

    const vistas = formatViews(views)
    const canal = author.name || 'Desconocido'

    const infoMessage = `> *_${title}_*
֯🐯 » Canal › *${canal}*
֯🌾 » Duración › *${timestamp}*
֯🍂 » Vistas › *${vistas}*
ֶ֯🌴 » Publicado › *${ago}*
֯🐢 » Enlace › *${url}*
`.trim()

    const thumb = (await conn.getFile(thumbnail))?.data
    await conn.sendMessage(m.chat, { image: thumb, caption: infoMessage }, { quoted: m })

    const isAudio = ['play', 'yta', 'ytmp3', 'playaudio'].includes(command)
    const isVideo = ['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)
    if (!isAudio && !isVideo) return conn.sendMessage(m.chat, { text: `> *_YouTube - Play_* 🎶\n✩ Comando no reconocido.` }, { quoted: m })

    const format = isAudio ? 'audio' : 'video'
    const apiUrl = `${api.url}/download/yt?apikey=${api.key}&url=${encodeURIComponent(url)}&format=${format}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.data?.url) throw new Error(json.message || 'No se pudo obtener el enlace de descarga.')
    const downloadUrl = json.data.url

    if (isAudio) {
      await conn.sendMessage(m.chat, {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m })
    } else if (isVideo) {
      const headRes = await fetch(downloadUrl)
      const fileSizeMB = (parseInt(headRes.headers.get('Content-Length') || '0', 10) / (1024*1024))
      const asDocument = fileSizeMB >= limitMB

      await conn.sendMessage(m.chat, {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption: `> ✩ Descarga completada.`,
        asDocument
      }, { quoted: m })
    }

  } catch (error) {
    console.error('[ERROR YOUTUBE]', error)
    return conn.sendMessage(m.chat, { text: `> *_YouTube - Play_* 🎶\n✩ Error: ${error.message || error}` }, { quoted: m })
  }
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4']
handler.tags = ['descargas']

export default handler

function formatViews(views) {
  if (views === undefined) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K (${views.toLocaleString()})`
  return views.toString()
}