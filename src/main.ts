// #!/usr/bin/env node

import { JSONL, Lexer, Parser } from "./types";
import { createReadStream, createWriteStream } from "fs";
import { readFile } from "fs/promises";

async function exec(filepath: string) {
    const code = await readFile(filepath, 'utf-8');
    let lexer = new Lexer(code);
    let tokens = lexer.tokenize();

    let parser = new Parser(tokens);
    let ast = parser.parse();

    return new JSONL().run(ast);
}

async function main() {
    const args = process.argv.slice(2);

    let output_file: string | undefined;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-o') {
            output_file = args[i + 1];
            i++;
        }
    }

    let input_files = args.filter(arg => arg !== '-o' && arg !== output_file);
    try {

        let writeStream;
        if (output_file) {
            writeStream = createWriteStream(output_file, { flags: 'a', encoding: 'utf-8' });
        }

        for (let filepath of input_files) {

            const jsonl = await exec(filepath);

            if (writeStream) {
                writeStream.write(jsonl + "\n");
            } else {

                console.log(jsonl);
            }
        }

        if (writeStream) {
            writeStream.end();
            console.log(`Successfully written to ${output_file}`);
        }
    } catch (error) {
        console.error("Error processing files:", error);
    }
}

main().catch(err => {
    console.error("An error occurred:", err);
});