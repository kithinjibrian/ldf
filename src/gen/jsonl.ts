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
    NoSpaceNode,
    NumberNode,
    OlNode,
    ParagraphNode,
    SinkholeNode,
    StringNode,
    UlNode
} from "@kithinji/lml";

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
        //console.log(node.type)
    }

    public visit(node?: ASTNode, args?: Record<string, any>): any {
        if (node == undefined) return "";

        return node.accept(this, args);
    }

    public write(code: string) {
        this.codeBuffer.push(code);
    }

    public run() {
        try {
            const ast = lml(this.code);
            this.visit(ast)

            return this.codeBuffer.join("");
        } catch (e) {
            throw e;
        }
    }

    visitDocument(
        node: DocumentNode,
        args?: Record<string, any>
    ) {
        this.visit(node.document, args)
    }

    visitElementList(
        node: ElementListNode,
        args?: Record<string, any>
    ) {
        return node.sources
            .forEach((src, index) => {
                this.visit(src, args)

                if (index < node.sources.length - 1)
                    this.write("\n");
            })
    }

    visitBlock(
        node: BlockNode,
        args?: Record<string, any>
    ) {
        return node.body
            .forEach((src, index) => {

                this.visit(src, args)

                if (src instanceof SinkholeNode) {
                    if (index < node.body.length - 1)
                        this.write(", ");
                }
            });
    }

    visitSinkhole(node: SinkholeNode, args?: Record<string, any>) {
        switch (node.name) {
            case "conversation": {
                this.write(`{ "messages": [`)
                this.visit(node.body)
                this.write("]}")
                break;
            }

            case "system": {
                this.write(`{ "role": "system", `);
                this.visit(node.body);
                this.write(" }");
                break;
            }

            case "user": {
                this.write(`{ "role": "user", `);
                this.visit(node.body);
                this.write(" }");
                break;
            }

            case "assistant": {
                this.write(`{ "role": "assistant", `);
                this.visit(node.body);
                this.write(" }");
                break;
            }

            case "tool": {
                if ("tool" in this.config && this.config.tool == "to_assistant")
                    this.write(`{ "role": "assistant", `);
                else
                    this.write(`{ "role": "tool", `);

                this.visit(node.body);
                this.write(" }");
                break;
            }

            case "content": {
                this.write(`"content": "`);
                this.visit(node.body)
                this.write(`"`);
                break;
            }

            case "answer": {
                this.write(`answer { `);
                this.visit(node.body)
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
                this.visit(node.body)
                this.write(` }`);
                break;
            }
        }
    }

    visitH1(
        node: H1Node,
        args?: Record<string, any>
    ) {
        this.write(`h1`)

        if (node.attributes)
            this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        this.visit(node.body);
        this.write(` }`)
    }

    visitH2(
        node: H2Node,
        args?: Record<string, any>
    ) {
        this.write(`h2`)

        if (node.attributes)
            this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        this.visit(node.body);
        this.write(` }`)
    }

    visitH3(
        node: H3Node,
        args?: Record<string, any>
    ) {
        this.write(`h3`)

        if (node.attributes)
            this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        this.visit(node.body);
        this.write(` }`)
    }

    visitH4(
        node: H4Node,
        args?: Record<string, any>
    ) {
        this.write(`h4`)

        if (node.attributes)
            this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        this.visit(node.body);
        this.write(` }`)
    }

    visitH5(
        node: H5Node,
        args?: Record<string, any>
    ) {
        this.write(`h5`)

        if (node.attributes)
            this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        this.visit(node.body);
        this.write(` }`)
    }

    visitH6(
        node: H6Node,
        args?: Record<string, any>
    ) {
        this.write(`h6`)

        if (node.attributes)
            this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        this.visit(node.body);
        this.write(` }`)
    }

    visitParagraph(
        node: ParagraphNode,
        args?: Record<string, any>
    ) {
        this.write(`p`)

        if (node.attributes)
            this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        this.visit(node.body);
        this.write(` }`)
    }

    visitOl(
        node: OlNode,
        args?: Record<string, any>
    ) {
        this.write(`ol`)

        if (node.attributes)
            this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        this.visit(node.body);
        this.write(` }`)
    }

    visitUl(
        node: UlNode,
        args?: Record<string, any>
    ) {
        this.write(`ul`)

        if (node.attributes)
            this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        this.visit(node.body);
        this.write(` }`)
    }

    visitLi(
        node: LiNode,
        args?: Record<string, any>
    ) {
        this.write(`li`)

        if (node.attributes)
            this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ `)
        this.visit(node.body);
        this.write(` }`)
    }

    visitCode(
        node: CodeNode,
        args?: Record<string, any>
    ) {
        this.write(`code`)

        if (node.attributes)
            this.visit(node.attributes);
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

    visitImg(
        node: LiNode,
        args?: Record<string, any>
    ) {
        this.write(`img`)

        if (node.attributes)
            this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`{ "" }`)
    }

    visitSpan(
        node: LmlSpanNode,
        args?: Record<string, any>
    ) {
        this.write(`span`)

        if (node.attributes)
            this.visit(node.attributes);
        else
            this.write(" ");

        this.write(`< `)
        this.visit(node.body);
        this.write(` >`)
    }

    visitInput(
        node: InputNode,
        args?: Record<string, any>
    ) {
        this.write(`input`)

        const inline = node.body instanceof StringNode;

        if (node.attributes)
            this.visit(node.attributes);
        else {
            if (!inline)
                this.write(" ");
        }

        if (!inline)
            this.write("{ ")

        this.visit(node.body);

        if (!inline)
            this.write(" }")
    }

    visitButton(
        node: ButtonNode,
        args?: Record<string, any>
    ) {
        this.write(`button`)

        const inline = node.body instanceof StringNode;

        if (node.attributes)
            this.visit(node.attributes);
        else {
            if (!inline)
                this.write(" ");
        }


        if (!inline)
            this.write("{ ")

        this.visit(node.body);

        if (!inline)
            this.write(" }")
    }

    visitLink(
        node: LinkNode,
        args?: Record<string, any>
    ) {
        this.write(`link`)

        const inline = node.body instanceof StringNode;

        if (node.attributes)
            this.visit(node.attributes);
        else {
            if (!inline)
                this.write(" ");
        }


        if (!inline)
            this.write("{ ")

        this.visit(node.body);

        if (!inline)
            this.write(" }")
    }

    visitB(
        node: BNode,
        args?: Record<string, any>
    ) {
        this.write(`b${node.no_space ? '-' : ''}`)
        this.visit(node.attributes);
        this.visit(node.body);
    }

    visitC(
        node: CNode,
        args?: Record<string, any>
    ) {
        this.write(`c${node.no_space ? '-' : ''}`)
        this.visit(node.attributes);
        this.visit(node.body);
    }

    visitI(
        node: INode,
        args?: Record<string, any>
    ) {
        this.write(`i${node.no_space ? '-' : ''}`)
        this.visit(node.attributes);
        this.visit(node.body);
    }

    visitNoSpace(
        node: NoSpaceNode,
        args?: Record<string, any>
    ) {
        this.write(`ns`)
        this.visit(node.attributes);
        this.visit(node.body);
    }

    visitString(
        node: StringNode,
        args?: Record<string, any>
    ) {
        if (node.value == " ")
            this.write("\\n")
        else
            this.write(`'${JSON.stringify(node.value).slice(1, -1)}'`)
    }

    visitNumber(
        node: NumberNode,
        args?: Record<string, any>
    ) {
        this.write(`${node.value}`)
    }

    visitAttributeList(
        node: AttributeListNode,
        args?: Record<string, any>
    ) {
        this.write("[");
        node.attributes.forEach((src, index) => {
            this.visit(src);

            if (index < node.attributes.length - 1)
                this.write(", ");
        })
        this.write("] ");
    }

    visitAttribute(
        node: AttributeNode,
        args?: Record<string, any>
    ) {
        this.write(node.key.name);
        this.write("=");
        this.visit(node.value);
    }
}