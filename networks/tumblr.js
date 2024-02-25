import fs from "fs-extra"
import tumblr from "tumblr.js"
import util from "node:util"

import bot from "../bot.js"

const name = "Tumblr"
const tags = [ "bot", "ca-dmv-bot", "california", "dmv", "funny", "government", "lol", "public records" ]

var client
var handle
var blogName

// This is designed to work with only *one* blog!

function authenticate(credentials) {
    client = tumblr.createClient({
        consumer_key: credentials.consumerKey,
        consumer_secret: credentials.consumerSecret,
        token: credentials.accessToken,
        token_secret: credentials.accessTokenSecret
    })

    return new Promise((resolve) => {
        client.userInfo((_, data) => {
            blogName = data.user.blogs[0].name
            handle = data.user.name

            console.log(`Logged into Tumblr as "${handle}" (blog name: "${blogName}", blog title: "${data.user.blogs[0].title}")`)
            resolve()
        })
    })
}

async function post(plate) {
    let text = util.format(bot.formats.post, plate.customerComment, plate.dmvComment, plate.verdict ? "ACCEPTED" : "DENIED").replaceAll("\n", "<br>")
    
    let response = await client.createPost(blogName, {
        content: {
            type: "image",
            tag: tags,
            caption: text,
            media: fs.createReadStream(plate.fileName),
            altText: bot.formatAltText(plate.text)
        }
    })

    return response.post_url
}

function updateBio() {
    // Tumblr doesn't support updating a profiles description through the API. :-(
}

export default { name, authenticate, post, updateBio }