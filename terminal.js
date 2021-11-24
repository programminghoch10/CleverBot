const readline = require("readline")
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const bot = require("./api.js")

function ask(question) {
    return new Promise((resolve, reject) => {
        rl.question(question, (input) => resolve(input) );
    });
}

async function main() {
    while (true) {
        let query = await ask("You: ")
        if (query === "exit") break
        let result = await bot.query(query)
        console.log("CleverBot: " + result)
    }
    rl.close()
}

main()