export interface ASTVisitor {
    before_accept?(node: ASTNode, args?: Record<string, any>): any;
    after_accept?(node: ASTNode, args?: Record<string, any>): any;
    visitUser?(node: UserNode, args?: Record<string, any>): any;
    visitUse?(node: UseNode, args?: Record<string, any>): any;
    visitVar?(node: VarNode, args?: Record<string, any>): any;
    visitTool?(node: ToolNode, args?: Record<string, any>): any;
    visitThink?(node: ThinkNode, args?: Record<string, any>): any;
    visitSystem?(node: SystemNode, args?: Record<string, any>): any;
    visitString?(node: StringNode, args?: Record<string, any>): any;
    visitContent?(node: ContentNode, args?: Record<string, any>): any;
    visitAssistant?(node: AssistantNode, args?: Record<string, any>): any;
    visitConversation?(node: ConversationNode, args?: Record<string, any>): any;
    visitSourceElements?(node: SourceElementsNode, args?: Record<string, any>): any;
}

export interface ASTNode {
    type: string;
    attributes: Array<{}>;
    accept(visitor: ASTVisitor, args?: Record<string, any>): any;
}

export abstract class ASTNodeBase implements ASTNode {
    abstract type: string;
    attributes: Array<{ name: string, value: string }> = [];

    accept(visitor: ASTVisitor, args?: Record<string, any>) {
        visitor.before_accept?.(this, args);
        const res = this._accept(visitor, args);
        visitor.after_accept?.(this, args);

        return res;
    }

    abstract _accept(visitor: ASTVisitor, args?: Record<string, any>): void;
}


export class SourceElementsNode extends ASTNodeBase {
    type = 'SourceElements';

    constructor(public sources: ASTNode[]) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitSourceElements?.(this, args);
    }
}

export class ConversationNode extends ASTNodeBase {
    type = 'ConversationNode';

    constructor(public parties: ASTNode[]) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitConversation?.(this, args);
    }
}

export class UserNode extends ASTNodeBase {
    type = 'UserNode';

    constructor(public nodes: ASTNode[]) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitUser?.(this, args);
    }
}

export class VarNode extends ASTNodeBase {
    type = 'VarNode';

    constructor(public value: string) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitVar?.(this, args);
    }
}

export class UseNode extends ASTNodeBase {
    type = 'UseNode';

    constructor() {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitUse?.(this, args);
    }
}

export class SystemNode extends ASTNodeBase {
    type = 'SystemNode';

    constructor(public nodes: ASTNode[]) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitSystem?.(this, args);
    }
}

export class ToolNode extends ASTNodeBase {
    type = 'ToolNode';

    constructor(public nodes: ASTNode[]) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitTool?.(this, args);
    }
}

export class AssistantNode extends ASTNodeBase {
    type = 'AssistantNode';

    constructor(public response: ASTNode[]) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitAssistant?.(this, args);
    }
}

export class ContentNode extends ASTNodeBase {
    type = 'ContentNode';

    constructor(public content: ASTNode[]) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitContent?.(this, args);
    }
}

export class ThinkNode extends ASTNodeBase {
    type = 'ThinkNode';

    constructor(public text: string) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitThink?.(this, args);
    }
}

export class StringNode extends ASTNodeBase {
    type = 'StringNode';

    constructor(public string: string) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitString?.(this, args);
    }
}