export interface ASTVisitor {
    before_accept?(node: ASTNode, args?: Record<string, any>): any;
    after_accept?(node: ASTNode, args?: Record<string, any>): any;
    visitH1?(node: H1Node, args?: Record<string, any>): any;
    visitH2?(node: H2Node, args?: Record<string, any>): any;
    visitB?(node: BNode, args?: Record<string, any>): any;
    visitI?(node: INode, args?: Record<string, any>): any;
    visitUl?(node: UlNode, args?: Record<string, any>): any;
    visitLi?(node: LiNode, args?: Record<string, any>): any;
    visitOl?(node: OlNode, args?: Record<string, any>): any;
    visitQ?(node: QNode, args?: Record<string, any>): any;
    visitHr?(node: HrNode, args?: Record<string, any>): any;
    visitUser?(node: UserNode, args?: Record<string, any>): any;
    visitTool?(node: ToolNode, args?: Record<string, any>): any;
    visitCode?(node: CodeNode, args?: Record<string, any>): any;
    visitThink?(node: ThinkNode, args?: Record<string, any>): any;
    visitSystem?(node: SystemNode, args?: Record<string, any>): any;
    visitAction?(node: ActionNode, args?: Record<string, any>): any;
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

export class ActionNode extends ASTNodeBase {
    type = 'ActionNode';

    constructor(public action: ASTNode[]) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitAction?.(this, args);
    }
}

export class CodeNode extends ASTNodeBase {
    type = 'CodeNode';

    constructor(public code: string) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitCode?.(this, args);
    }
}

export class H1Node extends ASTNodeBase {
    type = 'H1Node';

    constructor(public text: string) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitH1?.(this, args);
    }
}

export class H2Node extends ASTNodeBase {
    type = 'H2Node';

    constructor(public text: string) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitH2?.(this, args);
    }
}

export class BNode extends ASTNodeBase {
    type = 'BNode';

    constructor(public text: string) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitB?.(this, args);
    }
}

export class INode extends ASTNodeBase {
    type = 'INode';

    constructor(public text: string) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitI?.(this, args);
    }
}

export class UlNode extends ASTNodeBase {
    type = 'UlNode';

    constructor(public list: ASTNode[]) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitUl?.(this, args);
    }
}

export class LiNode extends ASTNodeBase {
    type = 'LiNode';

    constructor(public text: string) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitLi?.(this, args);
    }
}

export class OlNode extends ASTNodeBase {
    type = 'OlNode';

    constructor(public list: ASTNode[]) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitOl?.(this, args);
    }
}

export class QNode extends ASTNodeBase {
    type = 'QNode';

    constructor(public text: string) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitQ?.(this, args);
    }
}


export class HrNode extends ASTNodeBase {
    type = 'HrNode';

    constructor(public text: string) {
        super();
    }

    _accept(visitor: ASTVisitor, args?: Record<string, any>): void {
        return visitor.visitHr?.(this, args);
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