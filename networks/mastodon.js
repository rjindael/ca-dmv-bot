import fs from "fs-extra"
import { createRestAPIClient } from "masto"
import util from "node:util"

import bot from "../bot.js"

const name = "Mastodon"

var client

async function authenticate(credentials) {
    client = createRestAPIClient(credentials)

    let user = await client.v1.accounts.verifyCredentials()
    console.log(`Logged into Mastodon as "${user.displayName}" (@${user.acct} : ${user.id})`)
}

async function post(plate) {
    let text = util.format(bot.formats.post, plate.customerComment, plate.dmvComment, plate.verdict ? "ACCEPTED" : "DENIED")
    let attachment = await client.v2.mediaAttachments.create({
        file: new Blob([ fs.readFileSync(plate.fileName) ]),
        description: bot.formatAltText(plate.text)
    })

    let post = await client.v1.statuses.create({
        status: text,
        visibility: "public",
        mediaIds: [ attachment.id ]
    })

    return post.url
}

async function updateBio(text) {
    await client.v1.accounts.updateCredentials({ note: text })   
}

export default { name, authenticate, post, updateBio }