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

async function queryBot(msg) {
    let chatid = msg.chat.id
    let chat = botdb.getChat(chatid).map(msg => msg.text)
    chat.push(msg.text)
    let cvbotresponse = await cvbot.queryChat(chat)
    let responsemessage = await bot.sendMessage(msg.chat.id, cvbotresponse)
    botdb.pushChat(chatid, msg, responsemessage)
}

bot.onText(/^(?![\/]).*$/ig, async (msg, match) => {
    queryBot(msg)
})

bot.onText(/^\/.*$/, (msg, match) => {
    const text = msg.text.substring(1)
    const chatid = msg.chat.id
    switch (text) {
        default:
            notifyUser(chatid, "Unrecognized command!", 5, msg)
            break
        case "ping":
            notifyUser(chatid, "/pong", 30, msg)
            break
        case "pong":
            notifyUser(chatid, "/ping", 30, msg)
            break
        case "start":
            bot.sendMessage(msg.chat.id, welcometext)
            break
        case "clear":
            botdb.clearChat(msg.chat.id)
            bot.sendMessage(msg.chat.id, cleartext)
            break
        case "wipe":
            botdb.clearChat(msg.chat.id, (msg) => bot.deleteMessage(msg.chat.id, msg.message_id))
            bot.sendMessage(msg.chat.id, cleartext)
            break
        case "thinkaboutit":
            msg.text = ""
            queryBot(msg)
            delayedDeleteMessage(msg, 5)
            break
        case "thinkforme":
        case "pass":
            msg.text = "[pass]"
            queryBot(msg)
            delayedDeleteMessage(msg, 5)
    }
})

async function notifyUser(chatid, text, timeout = 15, deleteMessage) {
    bot.sendMessage(chatid, text).then(msg => {
        setTimeout(() => {
            bot.deleteMessage(msg.chat.id, msg.message_id)
            if (deleteMessage != undefined)
                bot.deleteMessage(deleteMessage.chat.id, deleteMessage.message_id)
        }, timeout * 1000)
    })
}

async function delayedDeleteMessage(msg, timeout) {
    setTimeout(() => {
        bot.deleteMessage(msg.chat.id, msg.message_id)
    }, timeout * 1000)
}

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