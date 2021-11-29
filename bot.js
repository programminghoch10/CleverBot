import fs from "fs"
import TelegramBot from "node-telegram-bot-api"
import cvbot from "./api.js"
import botdb from "./botdb.js"

const token = fs.readFileSync("token.txt")
const bot = new TelegramBot(token, {polling: true})
const args = process.argv.slice(2)
const oneshot = args.filter(item => item == "oneshot").length > 0 
const welcometext = fs.readFileSync("botwelcomemessage.txt")
const cleartext = fs.readFileSync("botclearmessage.txt")

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
    let id = msg.chat.id
    let chat = botdb.getChat(id).map(msg => msg.text)
    chat.push(msg.text)
    let cvbotresponse = await cvbot.queryChat(chat)
    let responsemessage = await bot.sendMessage(msg.chat.id, cvbotresponse)
    botdb.pushChat(id, msg, responsemessage)
})

bot.onText(/\/start/, (msg, match) => {
    bot.sendMessage(msg.chat.id, welcometext)
})

bot.onText(/\/clear/, (msg, match) => {
    botdb.clearChat(msg.chat.id)
    bot.sendMessage(msg.chat.id, cleartext)
})

bot.on('message', (msg) => {
    if (!msg.text) bot.deleteMessage(msg.chat.id, msg.message_id)
})

bot.on("polling_error", console.log)

process.on('SIGINT', async function() {
    console.log("Keyboard interrupt!")
    await stopBot()
    process.exit(0)
})

async function stopBot() {
        await bot.stopPolling()
        await sleep(10)
}

async function main() {
    if (oneshot) {
        await sleep(1000)
        await stopBot()
        process.exit(0)
    }
}
main()