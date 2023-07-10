import crypto from "node:crypto"
import csv from "csv-parser"
import fs from "fs-extra"
import gm from "gm"
import path from "node:path"
import strToStream from "string-to-stream"
import util from "node:util"

import moderation from "./moderation.js"
import twitter from "./networks/twitter.js"
import mastodon from "./networks/mastodon.js"
import tumblr from "./networks/tumblr.js"

const __dirname = path.resolve()

const services = { "twitter": twitter, "mastodon": mastodon, "tumblr": tumblr }
const repositoryURL = "https://github.com/rjindael/ca-dmv-bot"
const symbols = { "#": "hand", "$": "heart", "+": "plus", "&": "star", "/": "" }
const formats = {
    altText: "California license plate with text \"%s\".",
    bio: "Real personalized license plate applications that the California DMV received from 2015-2017. Posts hourly. Not the actual DMV. (%d% complete)",
    post: "Customer: %s\nDMV: %s\n\nVerdict: %s"
}

var records = []
var totalSourceRecords = 0

async function initialize(credentials) {
    await services.twitter.authenticate(credentials.twitter)
    await services.mastodon.authenticate(credentials.mastodon)
    await services.tumblr.authenticate(credentials.tumblr)

    if (!fs.existsSync("./resources")) {
        throw "Bad install"
    }

    let sourceRecords = []
    for (let file of fs.readdirSync("./resources/workbooks")) {
        if (file.split(".").pop() == "csv") {
            await new Promise((resolve) => {
                strToStream(fs.readFileSync(`./resources/workbooks/${file}`)).pipe(csv()).on("data", record => sourceRecords.push(record)).on("end", resolve)
            })
        }
    }

    totalSourceRecords = sourceRecords.length

    if (!fs.existsSync("./data") || !fs.existsSync("./data/records.json")) {
        fs.ensureDirSync("./data")
        fs.ensureDirSync("./data/tmp")
        fs.writeFileSync("./data/queue.json", "[]")
        fs.writeFileSync("./data/posted.json", "[]")

        /**
         * plate, review_reason_code, customer_meaning, reviewer_comments, status
         * text,                      customer,         dmv,               verdict
         */
        
        let parsedSourceRecords = []

        for (let i = 0; i < sourceRecords.length; i++) {
            // hack
            if (sourceRecords[i].plate === undefined) {
                sourceRecords[i].plate = Object.values(sourceRecords[i])[0]
            }

            if (!sourceRecords[i].plate.length || (sourceRecords[i].status != "N" && sourceRecords[i].status != "Y")) {
                continue
            }

            parsedSourceRecords.push({
                "text": sourceRecords[i].plate.toUpperCase(),
                "customerComment": correctClericalErrors(sourceRecords[i].customer_meaning),
                "dmvComment": correctClericalErrors(sourceRecords[i].reviewer_comments),
                "verdict": sourceRecords[i].status == "Y"
            })
        }

        fs.writeFileSync("./data/records.json", JSON.stringify(parsedSourceRecords))
    }

    records = JSON.parse(fs.readFileSync("./data/records.json"))
}

/**
 * This is a small function to automatically correct clerical errors that exist in the source record data.
 * Many entries have columns that are like "NO MEANING REG 17", "NO MICRO", "NOT ON QUICKWEB YET".
 * 
 * If a comment contains a matching keyword, it modifies it to become a meaningless "(not on record)"
 * so that the plate may still be posted while preserving clarity.
 * 
 * This also strips enclosing quotation marks and duplicate quotation marks.
 */
function correctClericalErrors(comment) {
    if (!comment.length) { 
        return "(not on record)"
    }

    let matches = ["no micro", "not on micro", "reg 17", "quickweb", "quick web"]
    for (let i = 0; i < matches.length; i++) {
        if (comment.toLowerCase().includes(matches[i]) || comment.toLowerCase().trim() == matches[i]) {
            return "(not on record)"
        }
    }

    if (comment[0] == "\"" && comment[comment.length - 1] == "\"") {
        comment = comment.slice(1, -1)
    }

    comment = comment.replaceAll("\"\"", "\"")

    return comment
}

async function post(plate) {
    process.stdout.write(`Posting plate "${plate.text}"... `)

    let notification = await moderation.notify(plate)
    let urls = {}

    for (let [_, service] of Object.entries(services)) {
        try {
            urls[service.name] = await service.post(plate)
        } catch (e) {
            urls[service.name] = ` Service had an error. Error: \`${e.toString()}\` `
        }

        await moderation.updateNotification(notification, plate, urls, Object.keys(urls).length == Object.keys(services).length)
    }

    removePlate(plate)

    process.stdout.write("posted!\n")
}

async function getPlate() {
    let fileName = `./data/tmp/${crypto.randomBytes(16).toString("hex")}.png`
    let index = Math.floor(Math.random() * records.length)
    let plate = records[index]

    await drawPlateImage(plate.text, fileName)

    return {
        "index": index,
        "fileName": path.resolve(fileName),
        "text": plate.text,
        "customerComment": plate.customerComment,
        "dmvComment": plate.dmvComment,
        "verdict": plate.verdict
    }
}

function removePlateFromRecords(plate) {
    records.splice(plate.index, 1)
    fs.writeFileSync("./data/records.json", JSON.stringify(records))
}

function removePlate(plate) {
    fs.unlinkSync(plate.fileName)

    let posted = JSON.parse(fs.readFileSync("./data/posted.json"))
    posted.push(plate)
    fs.writeFileSync("./data/posted.json", JSON.stringify(posted))
}

function drawPlateImage(text, fileName) {
    return new Promise((resolve) => {
        let plate = gm(1280, 720, "#FFFFFFFF")

        // Draw license plate text
        plate.fill("#1F2A64")
        plate.font(path.join(__dirname, "resources", "fonts", "licenseplate.ttf"), 240)
        plate.drawText(0, 80, text, "center").raise(10, 190)
    
        // Draw watermark
        plate.fill("#00000032")
        plate.font(path.join(__dirname, "resources", "fonts", "cascadiacode.ttf"), 20)
        plate.drawText(25, 25, repositoryURL, "southeast")
    
        /**
         * Overlay this image with the license plate template
         * The way I do this is stupid, but unless gm.composite can accept a stream then this will have to do.
         */

        let overlayFileName = path.join(__dirname, "data", "tmp", `${path.basename(fileName).replace(/\.[^/.]+$/, "")}_overlay.png`)

        plate.write(overlayFileName, (error) => {
            if (error) { 
                throw error
            }

            plate = gm("./resources/template.png").composite(overlayFileName)
            plate.write(fileName, (error) => {
                if (error) {
                    throw error
                }

                fs.rmSync(overlayFileName)
                resolve()
            })
        })
    })
}

async function updateBio() {
    let percentage = (((totalSourceRecords - records.length) / totalSourceRecords) * 100).toFixed(2)

    for (let [_, service] of Object.entries(services)) {
        try {
            await service.updateBio(util.format(formats.bio, percentage))
        } catch (e) {
            console.log(`Service "${service.name}" had an error while updating the account bio. Error: ${e.toString}`)
        }
    }
}

function formatAltText(text) {
    let formattedText = ""
    
    for (let i = 0; i < text.length; i++) {
        if (text[i] == "/") {
            formattedText += " "
            continue
        }

        if (symbols[text[i]]) {
            formattedText += ` (${symbols[text[i]]}) `
            continue
        }

        formattedText += text[i]
    }

    formattedText = formattedText.trim()
    return util.format(formats.altText, formattedText)
}

export default { repositoryURL, formats, initialize, post, getPlate, removePlate, removePlateFromRecords, updateBio, formatAltText }