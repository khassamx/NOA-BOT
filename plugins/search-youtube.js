import yts from 'yt-search'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, text, command }) => {
  if (!text) return conn.sendMessage(m.chat, {
    text: `✎ Debes escribir algo para buscar en YouTube\n> • *Ejemplo:* ${usedPrefix + command} lofi anime`,
    ...global.rcanal
  }, { quoted: m })

  await m.react('⌚')

  const botJid = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = path.join('./JadiBots', botJid, 'config.json')
  let nombreBot = global.namebot || '❀ Mai-Bot ❀'
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.name) nombreBot = config.name
    } catch (err) {
      console.log('❌ Error leyendo config del subbot:', err)
    }
  }

  const imgPath = './storage/img/ytsearch.jpg'

  try {
    const results = await yts(text)
    const videos = results.videos.slice(0, 5)

    if (!videos.length) {
      await conn.sendMessage(m.chat, {
        text: `〄 No encontré resultados para *${text}*\n> • Intenta con otras palabras clave.`,
        ...global.rcanal
      }, { quoted: m })
      await m.react('❌')
      return
    }

    let caption = `> ∞ *Resultados para:* *${text}*\n\n`

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      caption += `✎ ${i + 1}. *${video.title}*\n`
      caption += `〄 *Descripción:* ${video.description?.slice(0, 100) || 'Sin descripción'}\n`
      caption += `⊹ *Autor:* ${video.author.name}\n`
      caption += `∞ *Duración:* ${video.timestamp}\n`
      caption += `✎ *Publicado:* ${video.ago}\n`
      caption += `〄 *Url:* ${video.url}\n\n`
    }

    caption += ``

    const messagePayload = /^https?:\/\//.test(imgPath)
      ? { image: { url: imgPath } }
      : { image: fs.readFileSync(imgPath) }

    await conn.sendMessage(m.chat, {
      ...messagePayload,
      caption: caption.trim(),
      mentions: conn.parseMention(caption),
      ...global.rcanal
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: `💥 Ocurrió un error al buscar tu consulta.\n> • Intenta más tarde.`,
      ...global.rcanal
    }, { quoted: m })
    await m.react('💥')
  }
}

handler.tags = ['search']
handler.help = ['ytsearch']
handler.command = ['ytsearch', 'yts', 'youtubesearch']
handler.register = false

export default handler