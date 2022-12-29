import fs from "node:fs"
import tumblr from "tumblr.js"
import util from "node:util"

import bot from "../bot.js"

const globalTags = [ "bot", "ca-dmv-bot", "california", "dmv", "funny", "government", "lol", "public records" ]
const name = "Tumblr"

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

            console.log(`Logged into Tumblr as "${handle}" (blog name: "${blogName}", blog title: "${data.user.blogs[0].title})"`)
            resolve()
        })
    })
}

function post(plate) {
    let text = util.format(bot.formats.post, plate.customerComment, plate.dmvComment, plate.verdict ? "ACCEPTED" : "DENIED").replaceAll("\n", "<br>")
    let altText = bot.formatAltText(plate.text).replaceAll("\"", "").replaceAll(".", "")
    let tagString = [ altText, ... globalTags].join(",")

    return new Promise((resolve) => {
        client.createPhotoPost(blogName, {
            caption: text,
            data64: fs.readFileSync(plate.fileName, { encoding: "base64" }),
            tags: tagString,
            link: bot.repositoryURL
        }, (_, data) => {
            resolve(`https://www.tumblr.com/${handle}/${data.id_string}`)
        })
    })
}

function updateBio() {
    // Tumblr doesn't support updating a profiles description through the API. :-(
}

export default { name, authenticate, post, updateBio }