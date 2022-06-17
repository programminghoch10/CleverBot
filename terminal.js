import readline from "readline"
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
import bot from "./api.js"

function ask(question) {
    return new Promise((resolve, reject) => {
        rl.question(question, (input) => resolve(input) );
    });
}

async function main() {
    console.log("Interactive Terminal mode started.")
    console.log()
    console.log("Type nothing to let CleverBot \"think about it\"")
    console.log("Type \"pass\" to let CleverBot \"think for me\"")
    console.log("Use \"exit\" to quit.")
    console.log()
    while (true) {
        let query = await ask("You: ")
        if (query === "exit") break
        if (query === "pass") query = "[pass]"
        let result = await bot.query(query)
        console.log("CleverBot: " + result)
    }
    rl.close()
}

main()