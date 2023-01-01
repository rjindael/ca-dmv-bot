import dotenv from "dotenv"
import fs from "node:fs"
import schedule from "node-schedule"

import bot from "./bot.js"
import moderation from "./moderation.js"

var queue = []

async function run() {
    while (queue.length == 0) {
        addPlatesToQueue(await moderation.process())
    }

    await bot.post(queue.pop())
    fs.writeFileSync("./data/queue.json", JSON.stringify(queue))

    await moderation.notifyQueueAmount(queue.length)
    await moderation.updateStatus(queue.length)
}

async function initialize() {
    dotenv.config()

    await moderation.initialize({
        token: process.env.DISCORD_TOKEN,
        channelId: process.env.DISCORD_CHANNEL_ID,
        moderatorRoleId: process.env.DISCORD_MODERATOR_ROLE_ID
    })

    await bot.initialize({
        twitter: {
            appKey: process.env.TWITTER_CONSUMER_KEY,
            appSecret: process.env.TWITTER_CONSUMER_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
        },

        mastodon: {
            url: process.env.MASTODON_URL,
            accessToken: process.env.MASTODON_ACCESS_TOKEN
        },

        tumblr: {
            consumerKey: process.env.TUMBLR_CONSUMER_KEY,
            consumerSecret: process.env.TUMBLR_CONSUMER_SECRET,
            accessToken: process.env.TUMBLR_TOKEN,
            accessTokenSecret: process.env.TUMBLR_TOKEN_SECRET
        }
    })

    // Hourly
    schedule.scheduleJob("0 * * * *", async () => {
        await run()
    })

    // Daily (at 0:00)
    schedule.scheduleJob("0 0 * * *", async () => {
        await bot.updateBio()
    })

    queue = JSON.parse(fs.readFileSync("./data/queue.json"))
    
    await moderation.updateStatus(queue.length)
    await bot.updateBio()
}

function getQueue() {
    return queue
}

function addPlatesToQueue(plates) {
    queue = queue.concat(plates)
    fs.writeFileSync("./data/queue.json", JSON.stringify(queue))
}

initialize()

export default { getQueue, addPlatesToQueue }