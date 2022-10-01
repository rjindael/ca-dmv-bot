const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js")

var client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions] })
var channel

const thumbsUp = "\uD83D\uDC4D" // U+1F44D in UTF-16 (👍)
const thumbsDown = "\uD83D\uDC4E" // U+1FF4E in UTF-16 (👎)
const warning = "\u26A0\uFE0F" // U+26A0 in UTF-16 (⚠️)

client.once("ready", () => {
    console.log(`Logged into Discord as "${client.user.tag}" (${client.user.id})`)
    channel = client.channels.cache.find(channel => channel.name === process.env.DISCORD_CHANNEL_NAME)
})

function verify(tweet) {
    return new Promise(async (resolve) => {
        let message = await channel.send({
            "files": [ tweet.plate.file ],
            "content": `\`\`\`${tweet.text}\`\`\``
                + `\n<@&${process.env.DISCORD_MODERATOR_ROLE_ID}> React to this message in order to post this plate (\`${tweet.plate.text}\`). This message will timeout in **1 day**. Only disapprove plates that may get the Twitter account suspended.\n`
                + `${tweet.trimmed && `\n**${warning} WARNING**: The customer reason was trimmed from its original to meet the Twitter 280 character limit! (tweet is now ${tweet.text.length} characters long) ${warning}` || ""}`
                + `${(tweet.plate.customer.toLowerCase().includes("quickweb") || tweet.plate.customer.toLowerCase().includes("no micro")) && `\n**${warning} WARNING**: This plate appears to be invalid. ${warning}` || ""}`,
        })

        Promise.all([ message.react(thumbsUp), message.react(thumbsDown) ])

        const filter = (reaction, user) => {
            let member = channel.guild.members.cache.get(user.id)            

            return ([thumbsUp, thumbsDown]).includes(reaction.emoji.name)
                && (!member.bot)
                && (member.permissions.has(PermissionsBitField.All, true) || member.roles.cache.has(process.env.DISCORD_MODERATOR_ROLE_ID))
        }

        const collector = message.createReactionCollector({ filter, time: 60 * 60 * 24 * 100 })
        let responded = false // this is a stupid hack since I don't really want to figure out how to detach event listeners

        collector.on("collect", async (reaction, user) => {
            responded = true
            let approved = reaction.emoji.name == thumbsUp
            
            if (approved) {
                await channel.send(`This plate was approved by <@${user.id}>. Posting to Twitter...`)
                resolve(true)
            } else {
                await channel.send(`This plate was disapproved by <@${user.id}>. Fetching another one...`)
                resolve(false)
            }

            message.reactions.removeAll()
        })

        collector.on("end", async () => {
            if (!responded) {
                await channel.send(`Nobody responded. Fetching another one...`)
                resolve(false)
                message.reactions.removeAll()
            }
        })
    })
}

async function notify(tweet) {
    await channel.send(`Successfully posted tweet! You may view it here: ${tweet}`)
}

function initialize(token) {
    client.login(token)
}

module.exports = { verify, notify, initialize }