import { Token, TokenType } from "../lexer/lexer";
import {
    AssistantNode,
    ASTNode,
    ContentNode,
    ConversationNode,
    SourceElementsNode,
    StringNode,
    SystemNode,
    ThinkNode,
    ToolNode,
    UseNode,
    UserNode,
    VarNode
} from "./ast";

export class Parser {
    private tokens: Token[] = [];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens.filter(token => token.type !== TokenType.Comment);
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    private is_at_end(): boolean {
        return this.current >= this.tokens.length ||
            this.peek().type === TokenType.EOF;
    }

    private advance(): Token {
        if (!this.is_at_end()) this.current++;
        return this.previous();
    }

    private check(type: TokenType): boolean {
        if (this.is_at_end()) return false;
        return this.peek().type === type;
    }

    private check_value(value: string): boolean {
        if (this.is_at_end()) return false;
        return this.peek().value === value;
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private match_value(...values: string[]): boolean {
        for (const value of values) {
            if (this.check_value(value)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private error(message: string): never {
        const token = this.peek();
        throw new Error(`${message} at line ${token.line}, column ${token.column}`);
    }

    public parse(): SourceElementsNode {
        return this.source_elements();
    }

    private source_elements(): SourceElementsNode {
        const sources: ASTNode[] = [];

        while (
            this.check_value("conversation") ||
            this.check_value("var")
        ) {
            sources.push(this.source_element());
        }

        return new SourceElementsNode(sources);
    }

    private source_element(): ASTNode {
        if (this.is_at_end()) {
            this.error("Unexpected end of input");
        }

        if (this.match(TokenType.Text)) {
            return this.string()
        }

        const tag = this.peek().value;
        const attr = this.peek().attributes

        if (!this.match_value(tag)) {
            this.error(`Expected opening '${tag}' tag`);
        }

        let result: ASTNode | null = null;

        switch (tag) {
            case "user":
            case "tool":
            case "system":
            case "content":
            case "assistant":
            case "conversation":
                result = this.container_tag(tag);
                break;
            case "use":
            case "var":
            case "think":
                result = this.text_tag(tag);
                break;
            default:
                this.error(`Unknown tag '${tag}'`);
        }

        if (!this.match_value(tag)) {
            this.error(`Expected closing '${tag}' tag`);
        }

        if (attr)
            result.attributes = attr

        return result;
    }

    private string(): StringNode {
        return new StringNode(this.previous().value)
    }

    private container_tag(tag: string): ASTNode {
        type TagDefinition = {
            allow_text?: boolean;
            white_list: string[];
            factory: (nodes: ASTNode[]) => ASTNode;
        };

        let tags: Record<string, TagDefinition> = {
            content: {
                allow_text: true,
                white_list: ["use"],
                factory(node: ASTNode[]) {
                    return new ContentNode(node);
                }
            },
            conversation: {
                white_list: ["user", "system", "assistant", "tool"],
                factory(node: ASTNode[]) {
                    return new ConversationNode(node);
                }
            },
            assistant: {
                white_list: ["think", "content"],
                factory(node: ASTNode[]) {
                    return new AssistantNode(node);
                }
            },
            user: {
                white_list: ["content"],
                factory(node: ASTNode[]) {
                    return new UserNode(node);
                }
            },
            system: {
                white_list: ["content"],
                factory(node: ASTNode[]) {
                    return new SystemNode(node);
                }
            },
            tool: {
                white_list: ["content"],
                factory(node: ASTNode[]) {
                    return new ToolNode(node);
                }
            },
        };

        const nodes: ASTNode[] = [];

        const { white_list, factory } = tags[tag];

        if (
            !this.check(TokenType.Text) &&
            !white_list.includes(this.peek().value)
        ) {
            throw new Error(`Unexpected tag: <${this.peek().value}/>. <${tag}/> expects one of: <${white_list.join(", ")}/>`);
        }

        while (
            (this.check(TokenType.Text) && tags[tag]["allow_text"]) ||
            tags[tag]["white_list"].includes(this.peek().value)
        ) {
            nodes.push(this.source_element());
        }

        return factory(nodes);
    }

    private text_tag(tag: string): ASTNode {
        if (!this.match(TokenType.Text)) {
            if (this.peek().value !== "use")
                this.error("Expected token text");
        }

        let value = this.previous().value;

        let nodes: Record<string, Function> = {
            think(value: string): ThinkNode {
                return new ThinkNode(value);
            },
            var(value: string): VarNode {
                return new VarNode(value);
            },
            use(): UseNode {
                return new UseNode();
            }
        }

        return nodes[tag](value);
    }
}