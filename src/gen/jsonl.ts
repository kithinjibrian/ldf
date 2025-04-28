import {
    ASTNode,
    AttributeListNode,
    AttributeNode,
    BlockNode,
    BNode,
    ButtonNode,
    CNode,
    CodeNode,
    DocumentNode,
    ElementListNode,
    H1Node,
    H2Node,
    H3Node,
    H4Node,
    H5Node,
    H6Node,
    INode,
    InputNode,
    LinkNode,
    LiNode,
    lml,
    LmlASTVisitor,
    LmlSpanNode,
    NumberNode,
    OlNode,
    ParagraphNode,
    ScriptNode,
    SinkholeNode,
    StringNode,
    UlNode
} from "@kithinji/lml";

import { exec } from "@kithinji/tlugha-node";

export class JSONL implements LmlASTVisitor {
    private codeBuffer: string[] = [];

    constructor(
        public code: string,
        public config: Record<string, any>
    ) { }

    public before_accept(
        node: ASTNode,
        args?: Record<string, any>
    ) {
        console.log(node.type)
    }

    public async visit(node?: ASTNode, args?: Record<string, any>): Promise<any> {
        if (node == undefined) return "";

        return await node.accept(this, args);
    }

    public write(code: string) {
        this.codeBuffer.push(code);
    }

    public async run() {
        try {
            const ast = await lml(this.code);
            await this.visit(ast)


            this.codeBuffer
                .join('')
                .split("\n")
                .filter(src => src !== "")
                .map((msg, index) => {
                    console.log(msg)

                    try {
                        JSON.parse(msg);
                    } catch (e) {
                        throw e;
                    }
                })

            return this.codeBuffer.filter(src => src !== "\n").join("");
        } catch (e) {
            throw e;
        }
    }

    async visitDocument(
        node: DocumentNode,
        args?: Record<string, any>
    ) {
        await this.visit(node.document, args)
    }

    async visitElementList(
        node: ElementListNode,
        args?: Record<string, any>
    ) {
        for (const [index, src] of node.sources.entries()) {
            await this.visit(src);

            if (index < node.sources.length - 1)
                this.write("\n");
        }
    }

    async visitBlock(
        node: BlockNode,
        args?: Record<string, any>
    ) {

        for (const [index, src] of node.body.entries()) {
            await this.visit(src, args);

            if (src instanceof SinkholeNode) {
                if (index < node.body.length - 1)
                    this.write(", ");
            }
        }
    }

    async visitSinkhole(node: SinkholeNode, args?: Record<string, any>) {
        switch (node.name) {
            case "conversation": {
                this.write(`{ "messages": [`)
                await this.visit(node.body)
                this.write("]}")
                break;
            }

            case "system": {
                this.write(`{ "role": "system", `);
                await this.visit(node.body);
                this.write(" }");
                break;
            }

            case "user": {
                this.write(`{ "role": "user", `);
                await this.visit(node.body);
                this.write(" }");
                break;
            }

            case "assistant": {
                this.write(`{ "role": "assistant", `);
                await this.visit(node.body);
                this.write(" }");
                break;
            }

            case "tool": {
                if ("tool" in this.config && this.config.tool == "to_assistant")
                    this.write(`{ "role": "assistant", `);
                else
                    this.write(`{ "role": "tool", `);

                await this.visit(node.body);
                this.write(" }");
                break;
            }

            case "content": {
                this.write(`"content": "`);
                await this.visit(node.body)
                this.write(`"`);
                break;
            }

            case "answer": {
                this.write(`answer { `);
                await this.visit(node.body)
                this.write(` }`);
                break;
            }

            case "reason": {
                if ("reason" in this.config &&
                    this.config.reason == "hide"
                ) {
                    break;
                }

                this.write(`reason { `);
                await this.visit(node.body)
                this.write(` }`);
                break;
            }
        }
    }

    async visitScript(
        node: ScriptNode,
        args?: Record<string, any>
    ) {

    }

    async visitH1(
        node: H1Node,
        args?: Record<string, any>
    ) {
        this.write(`h1`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        await this.visit(node.body);
        this.write(` }`)
    }

    async visitH2(
        node: H2Node,
        args?: Record<string, any>
    ) {
        this.write(`h2`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        await this.visit(node.body);
        this.write(` }`)
    }

    async visitH3(
        node: H3Node,
        args?: Record<string, any>
    ) {
        this.write(`h3`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        await this.visit(node.body);
        this.write(` }`)
    }

    async visitH4(
        node: H4Node,
        args?: Record<string, any>
    ) {
        this.write(`h4`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        await this.visit(node.body);
        this.write(` }`)
    }

    async visitH5(
        node: H5Node,
        args?: Record<string, any>
    ) {
        this.write(`h5`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        await this.visit(node.body);
        this.write(` }`)
    }

    async visitH6(
        node: H6Node,
        args?: Record<string, any>
    ) {
        this.write(`h6`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        await this.visit(node.body);
        this.write(` }`)
    }

    async visitParagraph(
        node: ParagraphNode,
        args?: Record<string, any>
    ) {
        this.write(`p`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        await this.visit(node.body);
        this.write(` }`)
    }

    async visitOl(
        node: OlNode,
        args?: Record<string, any>
    ) {
        this.write(`ol`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        await this.visit(node.body);
        this.write(` }`)
    }

    async visitUl(
        node: UlNode,
        args?: Record<string, any>
    ) {
        this.write(`ul`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        await this.visit(node.body);
        this.write(` }`)
    }

    async visitLi(
        node: LiNode,
        args?: Record<string, any>
    ) {
        this.write(`li`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        await this.visit(node.body);
        this.write(` }`)
    }

    async visitCode(
        node: CodeNode,
        args?: Record<string, any>
    ) {
        this.write(`code`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)


        if (
            node.body instanceof BlockNode &&
            node.body.body[0] instanceof StringNode
        ) {
            this.write(`\`${JSON.stringify(node.body.body[0].value).slice(1, -1)}\``);
        } else {
            throw new Error(`Expected a string in element 'code' but got ${node.body?.type}`);
        }

        this.write(` }`)
    }

    async visitImg(
        node: LiNode,
        args?: Record<string, any>
    ) {
        this.write(`img`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ "" }`)
    }

    async visitSpan(
        node: LmlSpanNode,
        args?: Record<string, any>
    ) {
        this.write(`span`)

        if (node.attributes)
            await this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`< `)
        await this.visit(node.body);
        this.write(` >`)
    }

    async visitInput(
        node: InputNode,
        args?: Record<string, any>
    ) {
        this.write(`input`)

        const inline = node.body instanceof StringNode;

        if (node.attributes)
            await this.visit(node.attributes);
        else {
            if (!inline)
                this.write(" ");
        }

        if (!inline)
            this.write("{ ")

        await this.visit(node.body);

        if (!inline)
            this.write(" }")
    }

    async visitButton(
        node: ButtonNode,
        args?: Record<string, any>
    ) {
        this.write(`button`)

        const inline = node.body instanceof StringNode;

        if (node.attributes)
            await this.visit(node.attributes);
        else {
            if (!inline)
                this.write(" ");
        }


        if (!inline)
            this.write("{ ")

        await this.visit(node.body);

        if (!inline)
            this.write(" }")
    }

    async visitLink(
        node: LinkNode,
        args?: Record<string, any>
    ) {
        this.write(`link`)

        const inline = node.body instanceof StringNode;

        if (node.attributes)
            await this.visit(node.attributes);
        else {
            if (!inline)
                this.write(" ");
        }


        if (!inline)
            this.write("{ ")

        await this.visit(node.body);

        if (!inline)
            this.write(" }")
    }

    async visitB(
        node: BNode,
        args?: Record<string, any>
    ) {
        await this.visit(node.attributes);
        await this.visit(node.body);
    }

    async visitC(
        node: CNode,
        args?: Record<string, any>
    ) {
        await this.visit(node.attributes);
        await this.visit(node.body);
    }

    async visitI(
        node: INode,
        args?: Record<string, any>
    ) {
        await this.visit(node.attributes);
        await this.visit(node.body);
    }

    async visitString(
        node: StringNode,
        args?: Record<string, any>
    ) {
        if (node.value == " ")
            return;
        else
            this.write(`\\"${JSON.stringify(node.value).replace(/\\"/g, '\\\\\\"').slice(1, -1)}\\"`)
    }

    async visitNumber(
        node: NumberNode,
        args?: Record<string, any>
    ) {
        this.write(`${node.value}`)
    }

    async visitAttributeList(
        node: AttributeListNode,
        args?: Record<string, any>
    ) {
        this.write("[");

        for (const [index, src] of node.attributes.entries()) {
            await this.visit(src)

            if (index < node.attributes.length - 1)
                this.write(", ");
        }

        this.write("] ");
    }

    async visitAttribute(
        node: AttributeNode,
        args?: Record<string, any>
    ) {
        this.write(node.key.name);
        this.write("=");
        await this.visit(node.value);
    }
}