import { TwitterApi } from "twitter-api-v2"
import util from "node:util"

import bot from "../bot.js"

const name = "Twitter"

var client
var handle

async function authenticate(credentials) {
    client = new TwitterApi(credentials)

    let user = await client.currentUser()
    handle = user.screen_name

    console.log(`Logged into Twitter as "${user.name}" (@${handle} : ${user.id_str})`)
}

async function post(plate) {
    let altText = bot.formatAltText(plate.text)
    let mediaId = await client.v1.uploadMedia(plate.fileName)

    // Pinnacle of API design
    await client.v1.createMediaMetadata(mediaId, {
        alt_text: {
            text: altText
        }
    })

    let text = util.format(bot.formats.post, plate.customerComment, plate.dmvComment, plate.verdict ? "ACCEPTED" : "DENIED")
    let snowflakeStr

    if (text.length <= 280) {
        let tweet = await client.v2.tweet({ text: text, media: { media_ids: [ mediaId ] } })
        snowflakeStr = tweet.data.id
    } else {
        /**
         * Trim the post, then add a reply to the original tweet with the customer comment.
         * This is a Twitter-specific case since Mastodon has a 500-char limit and Tumblr has
         * a 4096-char limit (i.e. both cases of which the records do not and will never exceed.)
         * 
         * However, this does **not** check if the DMV reviewer comments are too long, and this
         * will likely break if it does. That said, this should hopefully never happen. I hope I
         * won't have to come back to this later...
         */

        let removeCharacters = (text.length - 280) + 3 // "..."

        if (plate.customerComment.length - removeCharacters < 0) {
            console.error(`DMV reviewer comments exceeded the maximum Tweet length! Plate: "${plate.text}"`)
            return
        }

        let trimmedCustomerComment = plate.customerComment.slice(0, -removeCharacters)

        text = util.format(bot.formats.template, trimmedCustomerComment + "...", plate.dmvComment, plate.status ? "ACCEPTED" : "DENIED")
        
        let tweet = await client.v2.tweet({ text: text, media: { media_ids: [ mediaId ] } })
        snowflakeStr = tweet.id

        let replyText = `(This Tweet was trimmed from its original.)\n\nCustomer: ${plate.customerComment}`
        
        await client.v2.reply(replyText, tweet.data.id)
    }

    return `https://twitter.com/${handle}/status/${snowflakeStr}`
}

async function updateBio(text) {
    // Method deprecated & non-functional as of Elon Musk
    // await client.v1.updateAccountProfile({ description: text })
}

export default { name, authenticate, post, updateBio }