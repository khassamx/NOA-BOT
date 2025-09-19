import fetch from 'node-fetch'

const handler = async (m, { conn, text, command, usedPrefix }) => {
  try {
    if (!text?.trim()) {
      return conn.sendMessage(m.chat, {
        text: `> ✩ Usa ${usedPrefix + command} *<prompt>*`
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      text: `> ✩ Generando tu imagen, esto puede tomar unos segundos..`,
    }, { quoted: m })

    const apiUrl = `https://myapiadonix.casacam.net/ai/nanobanana?apikey=Adofreekey&text=${encodeURIComponent(text)}`
    const res = await fetch(apiUrl)

    if (!res.ok) throw new Error('No se pudo generar la imagen.')

    const buffer = await res.arrayBuffer()
    const imageBuffer = Buffer.from(buffer)

    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `> ✩ Imagen generada con el modelo *Nanobanana*\n> ✦ Texto: ${text}`,
    }, { quoted: m })

  } catch (error) {
    console.error('[ERROR NANOBANANA]', error)
    return conn.sendMessage(m.chat, { text: `> ✩ Error al generar la imagen\n✦ ${error.message || error}` }, { quoted: m })
  }
}

handler.command = handler.help = ['nanobanana', 'imgia']
handler.tags = ['ia']
export default handler