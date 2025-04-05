import {
    ActionNode,
    AssistantNode,
    ASTNode,
    ASTVisitor,
    BNode,
    CodeNode,
    ContentNode,
    ConversationNode,
    H1Node,
    H2Node,
    INode,
    LiNode,
    OlNode,
    SourceElementsNode,
    StringNode,
    SystemNode,
    ThinkNode,
    ToolNode,
    UlNode,
    UserNode
} from "../parser/ast";

export class JSONL implements ASTVisitor {
    private codeBuffer: string[] = [];

    constructor() {

    }

    public write(code: string) {
        this.codeBuffer.push(code);
    }

    public before_accept(
        node: ASTNode,
        args?: Record<string, any>
    ) {
        // console.log(node.type);
    }

    public visit(node?: ASTNode, args?: Record<string, any>): void {
        if (node == undefined) return;
        node.accept(this, args);
    }

    public after_accept(
        node: ASTNode,
        args?: Record<string, any>
    ) {
    }

    public run(
        ast: ASTNode,
    ) {
        this.codeBuffer = [];

        this.visit(ast)

        return this.codeBuffer.join('');
    }

    visitSourceElements(
        node: SourceElementsNode,
        args?: Record<string, any>
    ) {
        for (let n = 0; n < node.sources.length; n++) {
            this.write(`{ "messages": [`)
            this.visit(node.sources[n], args);
            this.write("]}")

            if (n < node.sources.length - 1)
                this.write("\n")
        }
    }

    visitConversation(node: ConversationNode, args?: Record<string, any>) {
        node.parties.forEach((src, index) => {
            this.visit(src, args);
            if (index < node.parties.length - 1)
                this.write(", ");
        });
    }

    visitUser(node: UserNode, args?: Record<string, any>) {
        this.write(`{ "role": "user", `)
        node.nodes.forEach((src, index) => {
            this.visit(src)
            if (index < node.nodes.length - 1)
                this.write(", ");
        })
        this.write(" }")
    }

    visitSystem(node: SystemNode, args?: Record<string, any>) {
        this.write(`{ "role": "system", `)
        node.nodes.forEach((src, index) => {
            this.visit(src)
            if (index < node.nodes.length - 1)
                this.write(", ");
        })
        this.write(" }")
    }

    visitTool(node: ToolNode, args?: Record<string, any>) {
        this.write(`{ "role": "tool", `)
        node.nodes.forEach((src, index) => {
            this.visit(src)
            if (index < node.nodes.length - 1)
                this.write(", ");
        })
        this.write(" }")
    }

    visitAssistant(node: AssistantNode, args?: Record<string, any>) {
        this.write(`{ "role": "assistant", `)
        node.response.forEach((src, index) => {
            this.visit(src)
            if (index < node.response.length - 1)
                this.write(", ");
        })
        this.write(" }")
    }

    visitContent(node: ContentNode, args?: Record<string, any>) {
        this.write(`"content": "`);
        node.content.forEach((src, index) => {
            this.visit(src);
        })
        this.write(`"`);
    }

    visitThink(node: ThinkNode, args?: Record<string, any>) {
        this.write(`"think": "${JSON.stringify(node.text).slice(1, -1)}"`);
    }

    visitH1(node: H1Node, args?: Record<string, any>) {
        this.write(`# ${JSON.stringify(node.text).slice(1, -1)}`)
    }

    visitH2(node: H2Node, args?: Record<string, any>) {
        this.write(`## ${JSON.stringify(node.text).slice(1, -1)}`)
    }

    visitB(node: BNode, args?: Record<string, any>) {
        this.write(`**${JSON.stringify(node.text).slice(1, -1)}**`)
    }

    visitI(node: INode, args?: Record<string, any>) {
        this.write(`*${JSON.stringify(node.text).slice(1, -1)}*`)
    }

    visitLi(node: LiNode, args?: Record<string, any>) {
        this.write(`${JSON.stringify(node.text).slice(1, -1)}`)
    }

    visitUl(node: UlNode, args?: Record<string, any>) {
        node.list.forEach((src, index) => {
            this.write(`- `)
            this.visit(src)
            this.write(`\\n`)
        })
    }

    visitOl(node: OlNode, args?: Record<string, any>) {
        node.list.forEach((src, index) => {
            this.write(`${index + 1}. `)
            this.visit(src)
            this.write(`\\n`)
        })
    }

    visitAction(node: ActionNode, args?: Record<string, any>) {
        let type = "";
        node.attributes.forEach(attr => {
            if (attr.name == "type") {
                type = attr.value
            }
        })

        this.write(`\\n<?${type}\\n`);

        node.action.forEach((src, index) => {
            this.visit(src)
        })

        this.write(`\\n?>\\n`);
    }

    visitCode(node: CodeNode, args?: Record<string, any>) {
        let lang = "";
        node.attributes.forEach(attr => {
            if (attr.name == "lang") {
                lang = attr.value
            }
        })

        this.write(`\\n\`\`\`${lang}\\n${JSON.stringify(node.code).slice(1, -1)}\\n\`\`\`\\n`);
    }

    visitString(node: StringNode, args?: Record<string, any>) {
        this.write(`${JSON.stringify(node.string).slice(1, -1)}`);
    }
}