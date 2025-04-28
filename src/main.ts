// #!/usr/bin/env node

import { mkdir, readFile, readdir, stat } from 'fs/promises';
import { createWriteStream } from 'fs';
import { join, extname } from 'path';
import { z } from 'zod';
import { JSONL } from './types';

const DataContainerSchema = z.object({
    src: z.string(),
    dist: z.string(),
    shards: z.array(z.string()),
    config: z.object({
        tool: z.string(),
        reasoning: z.string(),
    }).optional(),
});

type DataContainer = z.infer<typeof DataContainerSchema>;

async function exec(filepath: string, config: DataContainer) {
    const code = await readFile(filepath, 'utf-8');

    try {
        const json = new JSONL(code, config)
        return await json.run();
    } catch (e) {
        throw e;
    }
}

async function getLdfFiles(dir: string): Promise<string[]> {
    let files: string[] = [];

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            files = [...files, ...(await getLdfFiles(fullPath))];
        } else if (entry.isFile() && extname(entry.name) === '.ldf') {
            files.push(fullPath);
        }
    }

    return files;
}

async function main() {
    const args = process.argv.slice(2);

    if (!args[0]) {
        console.error("Usage: node script.js <config.json>");
        process.exit(1);
    }

    const raw = await readFile(args[0], 'utf-8');
    const parsed = DataContainerSchema.safeParse(JSON.parse(raw));

    if (!parsed.success) {
        console.error("❌ Config validation failed:");
        console.dir(parsed.error.format(), { depth: null });
        process.exit(1);
    }

    const config = parsed.data;

    const outputFilePath = join(config.dist, 'data.jsonl');

    await mkdir(config.dist, { recursive: true });

    const writeStream = createWriteStream(outputFilePath, { flags: 'a', encoding: 'utf-8' });

    console.log(`✅ Writing all results to ${outputFilePath}`);

    for (const shardRelPath of config.shards) {
        const shardPath = join(config.src, shardRelPath);

        const stats = await stat(shardPath);

        let filesToProcess: string[] = [];

        if (stats.isDirectory()) {
            filesToProcess = await getLdfFiles(shardPath);
        } else if (stats.isFile() && extname(shardPath) === '.ldf') {
            filesToProcess = [shardPath];
        } else {
            console.log(`Skipping unsupported shard type: ${shardPath}`);
            continue;
        }

        for (const inputPath of filesToProcess) {
            const jsonl = await exec(inputPath, config);

            writeStream.write(jsonl + "\n");
            console.log(`✅ Appended to ${outputFilePath}`);
        }
    }

    writeStream.end();
    console.log(`✅ All results written to ${outputFilePath}`);
}

main().catch(err => {
    console.error("An error occurred:", err);
});