const crypto = require("crypto")
const fs = require("fs")
const gm = require("gm")
const path = require("path")

var applications = []

let color = "#1f2a64"
let fontsize = 230
let offset = 70

function draw(text, file) {
    return new Promise((resolve, reject) => {
        let plate = gm(path.join(__dirname, "data", "plate.png")).fill(color)
        plate.font(path.join(__dirname, "data", "fontface.ttf"), fontsize)
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
    let file = path.join(__dirname, "temp", crypto.randomBytes(16).toString("hex") + ".png")
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
    fs.writeFileSync(path.join(__dirname, "data", "applications.dirty.json"), JSON.stringify(applications))
}

function initialize() {
    if (!fs.existsSync(path.join(__dirname, "data"))) {
        throw "Bad install"
    }

    if (!fs.existsSync(path.join(__dirname, "temp"))) {
        fs.mkdirSync(path.join(__dirname, "temp"))
    }

    if (!fs.existsSync(path.join(__dirname, "data", "applications.dirty.json"))) {
        fs.copyFileSync(path.join(__dirname, "data", "applications.json"), path.join(__dirname, "data", "applications.dirty.json"))
    }

    applications = require(path.join(__dirname, "data", "applications.dirty.json"))
}

module.exports = { draw, generate, remove, initialize }