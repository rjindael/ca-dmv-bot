const fs = require("fs")
const twit = require("twit")
const util = require("node:util")

const bio = "Real personalized license plate applications that the California DMV received from 2015-2016. Posts every hour. Not the actual DMV (see @CA_DMV). (%d%)"

var client
var handle

function format(plate) {
    if (plate.customer == "NO MICRO") {
        // explicit case -- always deny
        return false
    }

    let tweet = `Customer: ${plate.customer}\nDMV: ${plate.dmv}\n\nVerdict: ${plate.status ? "ACCEPTED": "DENIED"}`
    let trimmed = false

    if (tweet.length > 280) {
        let remove = (tweet.length - 280) + 3 // "..."
        
        if ((plate.customer.length - remove) < 0) {
            // too long (DMV reason is probably too long, and trimming it removes any humor)
            return false
        }

        trimmed = plate.customer.slice(0, -remove)
        tweet = `Customer: ${trimmed}...\nDMV: ${plate.dmv}\n\nVerdict: ${plate.status ? "ACCEPTED": "DENIED"}`
    }

    return {
        "plate": plate,
        "text": tweet,
        "trimmed": trimmed
    }
}

async function post(tweet) {
    return new Promise((resolve) => {
        client.post("media/upload", {
            media_data: fs.readFileSync(tweet.plate.file, { encoding: "base64" })
        }, (_, data, __) => {
            let meta = {
                media_id: data.media_id_string,
                alt_text: { text: `Personalized California license plate with text "${tweet.plate.text}."`}
            }
            
            client.post("media/metadata/create", meta, (error) => {
                if (!error) {
                    let parameters = { status: tweet.text, media_ids: [ meta.media_id ] }

                    client.post("statuses/update", parameters, (_, data, __) => {
                        resolve(`https://twitter.com/${data.user.screen_name}/status/${data.id_str}`)
                    })
                }
            })
        })
    })
}

function update(total, remainder) {
    client.post("account/update_profile", {
        description: util.format(bio, (((total - remainder) / total) * 100).toString().slice(0, 2))
    })
}

function initialize(authentication) {
    client = new twit(authentication)
    client.get("account/verify_credentials", (_, data, __) => {
        handle = data.screen_name
        console.log(`Logged into Twitter as "${data.name}" (@${data.screen_name} : ${data.id_str})`)
    })
}

module.exports = { format, post, initialize, update, handle }