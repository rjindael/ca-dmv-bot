const crypto = require("crypto")
const csv = require("csv-parser")
const fs = require("fs")
const gm = require("gm")
const path = require("path")
const str = require("string-to-stream")

const twitter = require("./twitter")

var applications = []
var total = 0

function draw(text, file) {
    return new Promise((resolve, reject) => {
        let plate = gm(1280, 720, "#FFFFFFFF")

        // Draw license plate text
        plate.fill("#2F3C59")
        plate.font(path.join(__dirname, "resources", "fontface.ttf"), 230)
        plate.drawText(0, 90, text, "center").raise(10, 181)

        // Draw watermark
        plate.fill("#00000032")
        plate.font("Calibri", 30)
        plate.drawText(20, 20, `@${twitter.getHandle()}`, "southwest")

        // Overlay this image with the license plate
        // This method is super stupid :-)
        plate.write(file + "_1.png", () => {
            plate = gm(path.join(__dirname, "resources", "template.png"))
            plate.composite(file + "_1.png")
            plate.write((file), () => {
                fs.rmSync(file + "_1.png")
                resolve()
            })
        })
    })
}

async function generate() {
    let file = path.join(__dirname, "data", "tmp", crypto.randomBytes(16).toString("hex") + ".png")
    let index = Math.floor(Math.random() * applications.length)
    let plate = applications[index]

    await draw(plate.text, file).catch((error) => console.error(error))

    return {
        "file": file,
        "index": index,
        "text": (plate.text).toString().toUpperCase(),
        "status": plate.status,
        "customer": (plate.customer.length == 0 ? "(no reason specified)" : plate.customer),
        "dmv": (plate.dmv.length == 0 ? "(no reason specified)" : plate.dmv)
    }
}

async function remove(plate) {
    applications.splice(plate.index, 1)
    fs.unlinkSync(plate.file)
    fs.writeFileSync(path.join(__dirname, "data", "applications.json"), JSON.stringify(applications))
}

async function initialize() {
    if (!fs.existsSync(path.join(__dirname, "resources")) || !fs.existsSync(path.join(__dirname, "resources", "veltman", "applications.csv"))) {
        throw "Bad install"
    }

    // Parse Veltman CSV
    let veltman = fs.readFileSync(path.join(__dirname, "resources", "veltman", "applications.csv"))
    let results = []
    await new Promise((resolve) => {
        str(veltman).pipe(csv()).on("data", (data) => results.push(data)).on("end", resolve)
    })

    total = results.length

    if (!fs.existsSync(path.join(__dirname, "data"))) {
        fs.mkdirSync(path.join(__dirname, "data"))
        fs.mkdirSync(path.join(__dirname, "data", "tmp"))

        // plate, review_reason_code, customer_meaning,reviewer_comments,status
        // text,                      customer,        dmv,              status
        
        let parsed = []

        for (let i = 0; i < results.length; i++) {
            if (!results[i].plate || (results[i].status != "N" && results[i].status != "Y")) {
                continue
            }

            parsed.push({
                "text": results[i].plate,
                "customer": results[i].customer_meaning,
                "dmv": results[i].reviewer_comments,
                "status": results[i].status == "Y"
            })
        }

        fs.writeFileSync(path.join(__dirname, "data", "applications.json"), JSON.stringify(parsed))
    }
    
    applications = require(path.join(__dirname, "data", "applications.json"))
}

function getTotal() {
    return total
}

function getRemainder() {
    return applications.length
}

module.exports = { draw, generate, remove, initialize, getTotal, getRemainder }