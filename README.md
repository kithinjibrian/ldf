# Transform LDF (lugha dataset format) to jsonl
Create LLM datasets in a simple intuitive format

# Instruction

```bash
npm i -g @kithinji/ldf

ldf data1.ldf data2.ldf -o data.jsonl
```

# LDF format example

```html
    <conversation>
        <user>
            <content>
                What is Lugha?
            </content>
        </user>
        <assistant>
            <content>
                Lugha is a minimal, embeddable programming language designed for simplicity and flexibility. With
                lightweight syntax and a small runtime, it serves as an ideal scripting language for applications, games,
                and embedded systems. Lugha has interpreters implemented in multiple languages, making it highly portable
                and easy to integrate into various environments.

                Key features of Lugha include:

                <ul>
                    <li>Minimalist design – A small core language with essential constructs.</li>
                    <li>Embeddable – Easily integrates into host applications with a simple API.</li>
                    <li>Multi-language support – Interpreters available in different programming languages.</li>
                    <li>Lightweight – Low memory footprint and fast execution.</li>
                </ul>

                Whether used for configuration, automation, or scripting within larger programs, Lugha provides a
                straightforward and efficient way to extend software functionality.
            </content>
        </assistant>
    </conversation>

    <conversation>
        <user>
            <content>
                How do you define a basic Lugha program?
            </content>
        </user>
        <assistant>
            <content>
                <code lang="lugha">
fun main(): unit {
    print("Hello, World!");
}
                </code>
            </content>
        </assistant>
    </conversation>
```

# Output

```jsonl
{ "messages": [{ "role": "user", "content": "What is Lugha?" }, { "role": "assistant", "content": "Lugha is a minimal, embeddable programming language designed for simplicity and flexibility. With\n            lightweight syntax and a small runtime, it serves as an ideal scripting language for applications, games,\n            and embedded systems. Lugha has interpreters implemented in multiple languages, making it highly portable\n            and easy to integrate into various environments.\n\n            Key features of Lugha include:- Minimalist design – A small core language with essential constructs.\n- Embeddable – Easily integrates into host applications with a simple API.\n- Multi-language support – Interpreters available in different programming languages.\n- Lightweight – Low memory footprint and fast execution.\nWhether used for configuration, automation, or scripting within larger programs, Lugha provides a\n            straightforward and efficient way to extend software functionality." }]}
{ "messages": [{ "role": "user", "content": "How do you define a basic Lugha program?" }, { "role": "assistant", "content": "\n```lugha\nfun main(): unit {\n    print(\"Hello, World!\");\n}\n```\n" }]}
```