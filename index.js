const dotenv = require("dotenv")
const schedule = require("node-schedule")

const discord = require("./discord")
const twitter = require("./twitter")
const dmv = require("./dmv")

var working = false

function verify(tweet) {
    return new Promise((resolve) => {
        if (tweet === false) {
            resolve(false)
        }
    
        discord.verify(tweet).then((approved) => {
            resolve(approved)
        })
    })
}

async function post() {
    working = true

    let tweet
    let valid = false

    while (!valid) {
        tweet = twitter.format(await dmv.generate())

        if (tweet === false) {
            dmv.remove(tweet.plate)
            continue
        }

        valid = await verify(tweet)

        if (!valid) {
            dmv.remove(tweet.plate)
        }
    }

    let link = await twitter.post(tweet)
    await discord.notify(link)
    
    dmv.remove(tweet.plate)

    working = false
}

dotenv.config()

(async () => {
    await dmv.initialize()
    await discord.initialize(process.env.DISCORD_TOKEN)
    await twitter.initialize({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token: process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    })

    schedule.scheduleJob("0 * * * *", async () => {
        if (!working) {
            // The caveat of this is that if any jobs need to be run while one is already running,
            // it'll just be canceled entirely instead of waiting for that one to complete
    
            await post()
        }
    })
    
    schedule.scheduleJob("0 0 * * *", () => {
        twitter.update(dmv.applications.length, dmv.total)
    })
})()