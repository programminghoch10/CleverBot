const cleverbot = require("cleverbot-free")

var history = []

async function query(text) {
    let context = history.length > 1 ? history : undefined
    let response = await cleverbot(text, context)
    history.push(text)
    history.push(response)
    return response
}

module.exports = {
    query: query,
}