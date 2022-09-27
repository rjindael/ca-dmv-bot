const dotenv = require("dotenv")

const discord = require("./discord")
const twitter = require("./twitter")
const dmv = require("./dmv")

dotenv.config()

dmv.initialize()
discord.initialize(process.env.DISCORD_TOKEN)
twitter.initialize({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

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
    await discord.notify(link, valid)
    
    dmv.remove(tweet.plate)
}

var working = false

setInterval(async () => {
    if (!working) {
        working = true
        await post()
        working = false
    }
}, process.env.TIMEOUT * 1000)