import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url));

const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

await db.read()
db.data ||= { chats: {} }
const chats = db.data.chats


function ensureChatExists(id) {
    if (!chats[id]) chats[id] = []
}

function getChat(id) {
    ensureChatExists(id)
    return chats[id].sort((a, b) => a.message_id - b.message_id)
}

async function pushChat(id, usermsg, answer) {
    ensureChatExists(id)
    chats[id].push(usermsg)
    chats[id].push(answer)
    await saveDB()
    limitChat(id)
}

const MSG_LIMIT = 50
async function limitChat(id) {
    ensureChatExists(id)
    while (chats[id].length > MSG_LIMIT) {
        chats[id] = chats[id].splice(0,2)
    }
    await saveDB()
}

async function clearChat(id) {
    delete chats[id]
    await saveDB()
}

async function saveDB() {
    await db.write()
}

export default {
    getChat: getChat,
    pushChat: pushChat,
    clearChat: clearChat,
    saveDB: saveDB
}
