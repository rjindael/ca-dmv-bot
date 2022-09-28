const { Client, GatewayIntentBits, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")

var client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions] })
var channel

client.once("ready", () => {
    console.log(`Logged into Discord as "${client.user.tag}" (${client.user.id})`)
    channel = client.channels.cache.find(channel => channel.name === process.env.DISCORD_CHANNEL_NAME)
})

function verify(tweet) {
    return new Promise(async (resolve) => {
        let components = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel("Approve")
                .setStyle(ButtonStyle.Primary)
                .setCustomId("approve")
                .setDisabled(false)
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel("Disapprove")
                .setStyle(ButtonStyle.Danger)
                .setCustomId("disapprove")
                .setDisabled(false)
        )

        let message = await channel.send({
            "files": [ tweet.plate.file ],
            "components": [ components ],
            "content": `<@&${process.env.DISCORD_MODERATOR_ROLE_ID}> Click the appropriate button to approve/disapprove this plate (\`${tweet.plate.text}\`).\nOnly disapprove plates that may get the Twitter account suspended.\nThis message will timeout in **1 day**.\n`
                + `${tweet.trimmed && `\n**WARNING**: The customer reason was trimmed from its original to meet the Twitter 280 character limit! (tweet is now ${tweet.text.length} characters long)` || ""}`
                + `${(tweet.plate.customer.toLowerCase().includes("quickweb") || tweet.plate.customer.toLowerCase().includes("no micro")) && `\n**WARNING**: This plate appears to be invalid.` || ""}`
                + `\`\`\`${tweet.text}\`\`\``
        })

        const filter = (interaction) => {
            let member = channel.guild.members.cache.get(interaction.user.id)
            return (!member.bot) && (member.permissions.has(PermissionsBitField.All, true) || member.roles.cache.has(process.env.DISCORD_MODERATOR_ROLE_ID))
        }

        const collector = message.createMessageComponentCollector({ filter, time: 60 * 60 * 24 * 100 })

        collector.on("collect", async (interaction) => {
            let user = channel.guild.members.cache.get(interaction.user.id)    
            
            if (interaction.customId === "approve") {
                await message.edit({
                    "components": [],
                    "content": `<@&${process.env.DISCORD_MODERATOR_ROLE_ID}> This plate was approved by <@${user.id}>.\n`
                                + "Posting to Twitter..."
                                + `\`\`\`${tweet.text}\`\`\``
                })

                resolve(message)
            } else {
                await message.edit({
                    "components": [],
                    "content": `<@&${process.env.DISCORD_MODERATOR_ROLE_ID}> This plate was disapproved by <@${user.id}>.\n`
                                + `\`\`\`${tweet.text}\`\`\``
                })

                resolve(false)
            }
        })

        collector.on("end", async (collected) => {
            if (!collected.size) {
                await message.edit({
                    "components": [],
                    "content": `<@&${process.env.DISCORD_MODERATOR_ROLE_ID}> Nobody responded.\n`
                                + `\`\`\`${tweet.text}\`\`\``
                })

                resolve(false)
            }
        })
    })
}

async function notify(tweet, message) {
    await message.edit(message.content.replace("Posting to Twitter...", `<${tweet}>`))
}

function initialize(token) {
    client.login(token)
}

module.exports = { verify, notify, initialize }
