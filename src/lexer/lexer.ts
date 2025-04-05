export enum TokenType {
    StartTag,
    EndTag,
    SelfClosingTag,
    Attribute,
    AttributeValue,
    Text,
    Comment,
    ProcessingInstruction,
    CDataSection,
    EOF,
    Whitespace
}

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
    depth?: number;
    attributes?: { name: string, value: string }[];
}

export class Lexer {
    private input: string;
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;
    private tagStack: string[] = [];

    constructor(input: string) {
        this.input = input.trim();
    }

    private peek(offset: number = 0): string {
        return this.position + offset < this.input.length ? this.input[this.position + offset] : '\0';
    }

    private advance(): string {
        const char = this.peek();
        this.position++;
        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        return char;
    }

    private skipWhitespace(): void {
        let foundWhitespace = false;
        while (/\s/.test(this.peek())) {
            this.advance();
            foundWhitespace = true;
        }
    }

    private readComment(): Token {
        const startLine = this.line;
        const startColumn = this.column;
        let value = '';

        // Skip '<!--'
        this.advance(); // <
        this.advance(); // !
        this.advance(); // -
        this.advance(); // -

        while (!(this.peek() === '-' && this.peek(1) === '-' && this.peek(2) === '>')) {
            value += this.advance();

            // Prevent infinite loop
            if (this.peek() === '\0') {
                throw new Error(`Unterminated comment at line ${startLine}, column ${startColumn}`);
            }
        }

        // Skip closing '-->'
        this.advance(); // -
        this.advance(); // -
        this.advance(); // >

        return {
            type: TokenType.Comment,
            value,
            line: startLine,
            column: startColumn,
            depth: this.tagStack.length
        };
    }

    private readProcessingInstruction(): Token {
        const startLine = this.line;
        const startColumn = this.column;
        let value = '';

        // Skip '<?' 
        this.advance(); // <
        this.advance(); // ?

        while (!(this.peek() === '?' && this.peek(1) === '>')) {
            value += this.advance();

            // Prevent infinite loop
            if (this.peek() === '\0') {
                throw new Error(`Unterminated processing instruction at line ${startLine}, column ${startColumn}`);
            }
        }

        // Skip closing '?>'
        this.advance(); // ?
        this.advance(); // >

        return {
            type: TokenType.ProcessingInstruction,
            value,
            line: startLine,
            column: startColumn,
            depth: this.tagStack.length
        };
    }

    private readCDataSection(): Token {
        const startLine = this.line;
        const startColumn = this.column;
        let value = '';

        // Skip '<![CDATA['
        for (let i = 0; i < 9; i++) {
            this.advance();
        }

        while (!(this.peek() === ']' && this.peek(1) === ']' && this.peek(2) === '>')) {
            value += this.advance();

            // Prevent infinite loop
            if (this.peek() === '\0') {
                throw new Error(`Unterminated CDATA section at line ${startLine}, column ${startColumn}`);
            }
        }

        // Skip closing ']]>'
        this.advance(); // ]
        this.advance(); // ]
        this.advance(); // >

        return {
            type: TokenType.CDataSection,
            value,
            line: startLine,
            column: startColumn,
            depth: this.tagStack.length
        };
    }

    private readTagName(): string {
        let name = '';
        while (/[a-zA-Z0-9_\-:]/.test(this.peek())) {
            name += this.advance();
        }
        return name;
    }

    private readAttributeName(): string {
        let name = '';
        while (/[a-zA-Z0-9_\-:]/.test(this.peek())) {
            name += this.advance();
        }
        return name;
    }

    private readAttributeValue(): string {
        const quote = this.advance(); // consume opening quote
        let value = '';

        while (this.peek() !== quote) {
            if (this.peek() === '\0') {
                throw new Error('Unterminated attribute value');
            }

            // Handle XML entity references
            if (this.peek() === '&') {
                const entities: { [key: string]: string } = {
                    'lt': '<',
                    'gt': '>',
                    'amp': '&',
                    'apos': "'",
                    'quot': '"'
                };
                this.advance(); // consume &
                let entityName = '';
                while (this.peek() !== ';') {
                    entityName += this.advance();
                }
                this.advance(); // consume ;
                value += entities[entityName] || '';
            } else {
                value += this.advance();
            }
        }

        this.advance(); // consume closing quote
        return value;
    }

    private readTag(): Token {
        const startLine = this.line;
        const startColumn = this.column;
        const attributes: { name: string, value: string }[] = [];

        // Consume opening '<'
        this.advance();

        // Check if it's an end tag
        let isEndTag = false;
        if (this.peek() === '/') {
            isEndTag = true;
            this.advance();
        }

        // Read tag name
        const name = this.readTagName();

        // Skip whitespace
        this.skipWhitespace();

        // Read attributes
        while (this.peek() !== '>' && this.peek() !== '/' && this.peek() !== '\0') {
            const attrName = this.readAttributeName();
            this.skipWhitespace();

            // Check for attribute value
            let attrValue = '';
            if (this.peek() === '=') {
                this.advance(); // consume '='
                this.skipWhitespace();

                // Attribute value (quoted)
                if (this.peek() === '"' || this.peek() === "'") {
                    attrValue = this.readAttributeValue();
                }
            }

            attributes.push({ name: attrName, value: attrValue });
            this.skipWhitespace();
        }

        // Determine tag type and handle nesting
        if (this.peek() === '>') {
            this.advance(); // consume '>'

            if (isEndTag) {
                // Ensure tags are properly nested
                if (this.tagStack.length > 0 && this.tagStack[this.tagStack.length - 1] === name) {
                    this.tagStack.pop();
                } else {
                    throw new Error(`Mismatched closing tag: expected ${this.tagStack[this.tagStack.length - 1]}, got ${name}`);
                }

                return {
                    type: TokenType.EndTag,
                    value: name,
                    line: startLine,
                    column: startColumn,
                    depth: this.tagStack.length,
                    attributes
                };
            } else {
                // For start tags, push to stack
                this.tagStack.push(name);
                return {
                    type: TokenType.StartTag,
                    value: name,
                    line: startLine,
                    column: startColumn,
                    depth: this.tagStack.length - 1,
                    attributes
                };
            }
        }

        // Check for self-closing tag
        if (this.peek() === '/') {
            this.advance(); // consume '/'
            this.advance(); // consume '>'
            return {
                type: TokenType.SelfClosingTag,
                value: name,
                line: startLine,
                column: startColumn,
                depth: this.tagStack.length,
                attributes
            };
        }

        throw new Error(`Invalid tag at line ${startLine}, column ${startColumn}`);
    }

    private readText(): Token {
        const startLine = this.line;
        const startColumn = this.column;
        let value = '';

        const entities: { [key: string]: string } = {
            'lt': '<',
            'gt': '>',
            'amp': '&',
            'apos': "'",
            'quot': '"'
        };

        while (this.peek() !== '<' && this.peek() !== '\0') {
            // Handle entity references in text
            if (this.peek() === '&') {
                this.advance(); // consume &
                let entityName = '';
                while (this.peek() !== ';') {
                    entityName += this.advance();
                }
                this.advance(); // consume ;
                value += entities[entityName] || '';
            } else {
                value += this.advance();
            }
        }

        // Trim whitespace
        value = value.trim();

        return {
            type: value ? TokenType.Text : TokenType.Whitespace,
            value,
            line: startLine,
            column: startColumn,
            depth: this.tagStack.length
        };
    }

    public getNextToken(): Token {
        // Skip initial whitespace
        this.skipWhitespace();

        // Check if we've reached the end of input
        if (this.position >= this.input.length) {
            return {
                type: TokenType.EOF,
                value: '',
                line: this.line,
                column: this.column,
                depth: 0
            };
        }

        const char = this.peek();

        // Check for different types of tokens
        if (char === '<') {
            // Check for special XML constructs
            if (this.peek(1) === '!') {
                if (this.peek(2) === '-' && this.peek(3) === '-') {
                    return this.readComment();
                }
                if (this.peek(2) === '[' && this.peek(3) === 'C' && this.peek(4) === 'D' &&
                    this.peek(5) === 'A' && this.peek(6) === 'T' && this.peek(7) === 'A' &&
                    this.peek(8) === '[') {
                    return this.readCDataSection();
                }
            }

            // Check for processing instruction
            if (this.peek(1) === '?') {
                return this.readProcessingInstruction();
            }

            // Regular tags
            return this.readTag();
        }

        // Text content
        return this.readText();
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];
        let token: Token;

        // Reset state before tokenization
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tagStack = [];

        do {
            token = this.getNextToken();
            if (token.type !== null && token.type !== TokenType.Whitespace) {
                tokens.push(token);
            }
        } while (token.type !== TokenType.EOF);

        // Check if all tags are closed
        if (this.tagStack.length > 0) {
            throw new Error(`Unclosed tags: ${this.tagStack.join(', ')}`);
        }

        return tokens;
    }
}