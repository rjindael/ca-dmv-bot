const { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")

var client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] })
var channel

const warning = "\u26A0\uFE0F" // U+26A0 in UTF-16 (⚠️)

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

        let warned = []
        let message = await channel.send({
            "files": [ tweet.plate.file ],
            "components": [ components ],
            "content": `Click the appropriate button to approve or disapprove this tweet. Please refer to the pins for moderation guidelines.\n\`\`\`${tweet.text}\`\`\``
                + `${tweet.trimmed && `\n${warning} **The customer reason was trimmed from its original to meet the Twitter 280 character limit.**` || ""}`
                + `${(tweet.plate.customer.toLowerCase().includes("quickweb") || tweet.plate.customer.toLowerCase().includes("no micro")) && `\n${warning} **This plate appears to be invalid.**` || ""}`
                + `\n`,
        })

        const filter = async (interaction) => {
            let member = channel.guild.members.cache.get(interaction.user.id)
            let passed = (!member.bot) && (member.permissions.has(PermissionsBitField.All, true) || member.roles.cache.has(process.env.DISCORD_MODERATOR_ROLE_ID))

            if (!passed && !member.bot && !warned.includes(member.id)) {
                warned.push(member.id)

                let warning = await channel.send(`<@${member.id}> You are not authorized to perform this action.`)
                setTimeout(() => {
                    warning.delete()
                }, 5 * 1000)
            }

            return passed
        }

        const collector = message.createMessageComponentCollector({ filter, time: 60 * 60 * 3 * 100 })

        collector.on("collect", async (interaction) => {
            let member = channel.guild.members.cache.get(interaction.user.id)
            
            message.removeAttachments()

            if (interaction.customId === "approve") {
                await message.edit({
                    "components": [],
                    "content": `Plate \`${tweet.plate.text}\` was approved by <@${member.id}>. Posting to Twitter...`
                })

                resolve(message)
            } else {
                await message.edit({
                    "components": [],
                    "content": `Plate \`${tweet.plate.text}\` was disapproved by <@${member.id}>.\n\`\`\`${tweet.text}\`\`\``
                })

                resolve(false)
            }
        })

        collector.on("end", async (collected) => {
            if (collected.size < 1) {
                message.removeAttachments()

                await message.edit({
                    "components": [],
                    "content": `<@&${process.env.DISCORD_MODERATOR_ROLE_ID}> Nobody responded.\n\`\`\`${tweet.text}\`\`\``
                })

                resolve(false)
            }
        })
    })
}

async function update(tweet, message) {
    await message.edit(message.content.replace("Posting to Twitter...", `<${tweet}>`))
}

async function notify() {
    await channel.send(`<@&${process.env.DISCORD_MODERATOR_ROLE_ID}> New plate!`)
}

function initialize(token) {
    client.login(token)

    return new Promise((resolve) => {
        client.once("ready", () => {
            console.log(`Logged into Discord as "${client.user.tag}" (${client.user.id})`)
            channel = client.channels.cache.find(channel => channel.name === process.env.DISCORD_CHANNEL_NAME)
    
            resolve()
        })
    })
}

module.exports = { verify, update, notify, initialize }