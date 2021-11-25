const fs = require("fs")
const TelegramBot = require("node-telegram-bot-api")

const token = fs.readFileSync("token.txt")
const bot = new TelegramBot(token, {polling: true})
const cvbot = require("./api.js")
const args = process.argv.slice(2)
const oneshot = args.filter(item => item == "oneshot").length > 0 
const welcometext = fs.readFileSync("botwelcomemessage.txt")

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

bot.onText(/\/ping/, (msg, match) => {
    bot.sendMessage(msg.chat.id, "/pong")
})
bot.onText(/\/pong/, (msg, match) => {
    bot.sendMessage(msg.chat.id, "/ping")
})

bot.onText(/^(?![\/]).*$/ig, async (msg, match)  => {
    bot.sendMessage(msg.chat.id, await cvbot.queryChat([msg.text]))
})

bot.onText(/\/start/, (msg, match) => {
    bot.sendMessage(msg.chat.id, welcometext)
})

async function main() {
    if (oneshot) {
        await sleep(1000)
        await bot.stopPolling()
        await sleep(10)
        process.exit(0)
    }
}
main()