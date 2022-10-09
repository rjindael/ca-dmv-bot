const crypto = require("crypto")
const fs = require("fs")
const gm = require("gm")
const path = require("path")

// SHA-512 hash of https://github.com/veltman/ca-license-plates/raw/599ec49d73c3e1696a4856fd47051b332b8e080e/applications.csv
const fingerprint = "b9e28f19405149ef4c3c4f128143f115d3b12f78da02cefe757a469289ee57fadaba9a2f644b32c5cdbf41ae18994426d2b8760fe74ed35f3439d8ef90d87694"

var applications = []
var total = 0

let color = "#1f2a64"
let fontsize = 230
let offset = 70

function draw(text, file) {
    return new Promise((resolve, reject) => {
        let plate = gm(path.join(__dirname, "resources", "plate.png")).fill(color)
        plate.font(path.join(__dirname, "resources", "fontface.ttf"), fontsize)
        plate.drawText(0, offset, text, "center")
    
        plate.write(file, (error) => {
            if (error) {
                reject(error)
            }

            resolve()
        })
    })
}

async function generate() {
    let file = path.join(__dirname, "data", "tmp", crypto.randomBytes(16).toString("hex") + ".png")
    let plate = applications[Math.floor(Math.random() * applications.length)]

    await draw(plate.text, file).catch((error) => console.error(error))

    return {
        "file": file,
        "text": plate.text,
        "status": plate.status,
        "customer": (plate.customer.length == 0 ? "(no reason specified)" : plate.customer),
        "dmv": (plate.dmv.length == 0 ? "(no reason specified)" : plate.dmv)
    }
}

async function remove(plate) {
    let index = applications.findIndex((application) => {
        return application.text == plate.text
    })

    applications.splice(index, 1)
    fs.unlinkSync(plate.file)
    fs.writeFileSync(path.join(__dirname, "data", "applications.json"), JSON.stringify(applications))
}

function initialize() {
    if (!fs.existsSync(path.join(__dirname, "resources")) || !fs.existsSync(path.join(__dirname, "resources", "veltman", "applications.csv"))) {
        throw "Bad install"
    }

    // Parse Veltman CSV
    let csv = fs.readFileSync(path.join(__dirname, "resources", "veltman", "applications.csv"))
    if (crypto.createHash("sha512").update(csv).digest("hex") != fingerprint) {
        throw "Invalid or corrupt data"
    }

    csv = csv.split("\n")
    csv.shift()

    total = csv.length

    if (!fs.existsSync(path.join(__dirname, "data"))) {
        fs.mkdirSync(path.join(__dirname, "data"))
        fs.mkdirSync(path.join(__dirname, "tmp"))

        // [0] text, [1], [2] customer, [3] dmv, [4] status

        for (let i = 0; i < csv.length; i++) {
            let rows = csv[i].split(",")

            csv[i] = {
                "text": rows[0],
                "customer": rows[2],
                "dmv": rows[3],
                "status": rows[4] == "Y"
            }
        }

        fs.writeFileSync(path.join(__dirname, "data", "applications.json"), JSON.stringify(csv))
    }
    
    applications = require(path.join(__dirname, "data", "applications.json"))
}

module.exports = { draw, generate, remove, initialize, total }