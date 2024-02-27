import fs from "fs-extra"
import bsky from "@atproto/api"
import util from "node:util"

import bot from "../bot.js"

const { BskyAgent } = bsky
const name = "Bluesky"

var agent
var handle

async function authenticate(credentials) {
    agent = new BskyAgent({ service: credentials.service })

    let response = await agent.login({ identifier: credentials.identifier, password: credentials.password })
    if (!response.success) {
        console.error(`Failed to log into Bluesky`)
        return
    }

    handle = response.data.handle

    console.log(`Logged into Bluesky as @${handle}`)
}

async function post(plate) {
    // TODO: Accomodate for Bluesky's 300char limit

    let text = util.format(bot.formats.post, plate.customerComment, plate.dmvComment, plate.verdict ? "ACCEPTED" : "DENIED")
    let altText = bot.formatAltText(plate.text)

    let image = await agent.uploadBlob(fs.readFileSync(plate.fileName), { encoding: "image/png" })
    let response = await agent.post({
        text: text,
        embed: {
            $type: "app.bsky.embed.images",
            images: [{
                image: image.data.blob,
                alt: altText
            }]
        },
        createdAt: new Date().toISOString()
    })

    return `https://bsky.app/profile/${handle}/post/${response.uri.split("/").pop()}`
}

async function updateBio(text) {
    await agent.upsertProfile((existing) => {
        existing.description = text
        return existing
    })
}

export default { name, authenticate, post, updateBio }