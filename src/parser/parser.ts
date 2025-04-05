import { Token, TokenType } from "../lexer/lexer";
import {
    ActionNode,
    AssistantNode,
    ASTNode,
    BNode,
    CodeNode,
    ContentNode,
    ConversationNode,
    H1Node,
    H2Node,
    HrNode,
    INode,
    LiNode,
    OlNode,
    QNode,
    SourceElementsNode,
    StringNode,
    SystemNode,
    ThinkNode,
    ToolNode,
    UlNode,
    UserNode
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

        while (this.check_value("conversation")) {
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
            case "ol":
            case "ul":
            case "user":
            case "tool":
            case "system":
            case "action":
            case "content":
            case "assistant":
            case "conversation":
                result = this.container_tag(tag);
                break;
            case "think":
            case "code":
            case "h1":
            case "h2":
            case "li":
            case "b":
            case "i":
            case "q":
            case "hr":
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
                white_list: ["action", "code", "h1", "h2", "b", "i", "ul", "ol", "li", "q", "hr"],
                factory(node: ASTNode[]) {
                    return new ContentNode(node);
                }
            },
            conversation: {
                white_list: ["user", "system", "assistant"],
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
            action: {
                white_list: ["code"],
                factory(node: ASTNode[]) {
                    return new ActionNode(node);
                }
            },
            ol: {
                white_list: ["li"],
                factory(node: ASTNode[]) {
                    return new OlNode(node);
                }
            },
            ul: {
                white_list: ["li"],
                factory(node: ASTNode[]) {
                    return new UlNode(node);
                }
            }
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
            this.error("Expected token text");
        }

        let value = this.previous().value;

        let nodes: Record<string, Function> = {
            think(value: string): ThinkNode {
                return new ThinkNode(value)
            },
            code(value: string): CodeNode {
                return new CodeNode(value)
            },
            h1(value: string): H1Node {
                return new H1Node(value)
            },
            h2(value: string): H2Node {
                return new H2Node(value)
            },
            b(value: string): BNode {
                return new BNode(value)
            },
            i(value: string): INode {
                return new INode(value)
            },
            li(value: string): LiNode {
                return new LiNode(value)
            },
            q(value: string): QNode {
                return new QNode(value)
            },
            hr(value: string): HrNode {
                return new HrNode(value)
            }
        }

        return nodes[tag](value);
    }
}