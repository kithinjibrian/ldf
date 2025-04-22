// #!/usr/bin/env node

import { JSONL, Lexer, Parser } from "./types";
import { createReadStream, createWriteStream } from "fs";
import { readFile } from "fs/promises";

async function exec(filepath: string, flags: { [key: string]: string }) {
    const code = await readFile(filepath, 'utf-8');
    let lexer = new Lexer(code);
    let tokens = lexer.tokenize();

    let parser = new Parser(tokens);
    let ast = parser.parse();

    return new JSONL({
        reasoning: flags["-r"] === "true",
        tool: flags["-t"] === "true"
    }).run(ast);
}

async function main() {
    const args = process.argv.slice(2);

    let flags: { [key: string]: string } = {};

    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('-')) {
            const flag = args[i];
            const value = args[i + 1];

            if (value && !value.startsWith('-')) {
                flags[flag] = value;
                i++;
            } else {
                flags[flag] = '';
            }
        }
    }

    let input_files = args.filter((arg, index) => {
        return !arg.startsWith('-') && !args[index - 1]?.startsWith('-');
    });

    try {

        let writeStream;
        if (flags["-o"]) {
            writeStream = createWriteStream(flags["-o"], { flags: 'a', encoding: 'utf-8' });
        }

        for (let filepath of input_files) {

            const jsonl = await exec(filepath, flags);

            if (writeStream) {
                writeStream.write(jsonl + "\n");
            } else {

                console.log(jsonl);
            }
        }

        if (writeStream) {
            writeStream.end();
            console.log(`Successfully written to ${flags["-o"]}`);
        }
    } catch (error) {
        console.error("Error processing files:", error);
    }
}

main().catch(err => {
    console.error("An error occurred:", err);
});