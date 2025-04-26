# Transform LDF (lugha dataset format) to jsonl
Create LLM datasets in a simple intuitive format

# Instruction

```bash
npm i -g @kithinji/ldf
```

# Write the config file (`ldf.json`)
```json
{
    "src": "src",
    "dist": "dist",
    "shards": [
        "lugha_dataset",
        "text-to-sql.ldf"
    ],
    "config": {
        "tool": "to_assistant",
        "reasoning": "hide"
    }
}
```

# How your files can be structured
```
|---- dist
|---- src
|       |----lugha_dataset
|       |    |----arrays.ldf
|       |    |----functions.ldf
|       |----text-to-sql.ldf
|---- ldf.json
```

The configuration file helps ldf parse your dataset.
- src: The home directory
- dist: Where to write the `data.jsonl` file
- shards: Where your data files are located
    - You can import folders and the tool will read all files ending with `.ldf` extension
    - You can also import individual files

# Example of a conversation
```
conversation {
    user {
        content {
p { "What can you do for me?" }
        }
    }

    assistant {
        content {
            reason {
p {
"Let me think. The user is asking what I can do for them."
"I have various tools in my arsenal that can help the user automate some tasks."
}
            }

            answer {
p { "I can read and reply your emails." }
            }
        }
    }
}
```

# To compile the dataset run
```
ldf ldf.json
```

# LDF will then convert that to JSONL format
```jsonl
{"messages":[{ "role": "user", "content": "p { \"What can you do for me\""}"}, { "role": "assistant", "content": "reason { p { \"Let me think...\" } } answer { p { \"I can read and reply your emails\" } }"}]}
```
