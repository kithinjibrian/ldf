import { lml } from "@kithinji/lml";
import {
    AssistantNode,
    ASTNode,
    ASTVisitor,
    ContentNode,
    ConversationNode,
    SourceElementsNode,
    StringNode,
    SystemNode,
    ThinkNode,
    ToolNode,
    UserNode,
    VarNode
} from "../parser/ast";

export class JSONL implements ASTVisitor {
    private codeBuffer: string[] = [];
    private vars: Map<string, any> = new Map();

    constructor() {

    }

    public write(code: string) {
        this.codeBuffer.push(code);
    }

    public before_accept(
        node: ASTNode,
        args?: Record<string, any>
    ) {
        //   console.log(node.type);
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

        this.codeBuffer.join('').split("\n").map((msg, index) => {
            let js = JSON.parse(msg);
            js.messages.map((m: any) => {
                try {
                    lml(m.content)
                } catch (e) {
                    throw e;
                }
            })
        })

        return this.codeBuffer.join('');
    }

    visitSourceElements(
        node: SourceElementsNode,
        args?: Record<string, any>
    ) {
        for (let n = 0; n < node.sources.length; n++) {
            if (node.sources[n].type == "VarNode") {
                this.visit(node.sources[n], args);
                continue;
            }

            this.write(`{ "messages": [`)
            this.visit(node.sources[n], args);
            this.write("]}")

            if (n < node.sources.length - 1)
                this.write("\n")
        }
    }

    visitVar(node: VarNode, args?: Record<string, any>) {
        let name = null;
        node.attributes.forEach(attr => {
            if (attr.name === "name") {
                name = attr.value;
            }
        });

        if (!name) throw new Error("Variable 'name' not defined");

        this.vars.set(name, node.value)
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

    visitUse(node: VarNode, args?: Record<string, any>) {
        let name = null;
        node.attributes.forEach(attr => {
            if (attr.name === "name") {
                name = attr.value;
            }
        });

        if (!name) throw new Error("Variable 'name' not defined");

        const value = this.vars.get(name)

        if (!value) throw new Error(`Variable '${name}' doesn't contain a value.`);

        this.write(`${JSON.stringify(value).slice(1, -1)}`);
    }

    visitThink(node: ThinkNode, args?: Record<string, any>) {
        this.write(`"think": "${JSON.stringify(node.text).slice(1, -1)}"`);
    }

    visitString(node: StringNode, args?: Record<string, any>) {
        this.write(`${JSON.stringify(node.string).slice(1, -1)}`);
    }
}