import { ChildrenFlags, Fragment, Portal, VNodeFlags } from "./VNode";
function createTextVNode(text) {
    return {
        _isVNode: true,
        // flags 是 VNodeFlags.TEXT
        flags: VNodeFlags.TEXT,
        tag: null,
        data: null,
        // 纯文本类型的 VNode，其 children 属性存储的是与之相符的文本内容
        children: text,
        // 文本节点没有子节点
        childFlags: ChildrenFlags.NO_CHILDREN,
        el: null
    };
}
function normalizeVNodes(children) {
    var newChildren = [];
    // 遍历 children
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.key == null) {
            // 如果原来的 VNode 没有key，则使用竖线(|)与该VNode在数组中的索引拼接而成的字符串作为key
            child.key = '|' + i;
        }
        newChildren.push(child);
    }
    // 返回新的children，此时 children 的类型就是 ChildrenFlags.KEYED_VNODES
    return newChildren;
}
export function h(tag, data, children) {
    if (data === void 0) { data = null; }
    if (children === void 0) { children = null; }
    var flags = null;
    if (typeof tag === 'string') {
        flags = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML;
    }
    else if (tag === Fragment) {
        flags = VNodeFlags.FRAGMENT;
    }
    else if (tag === Portal) {
        flags = VNodeFlags.PORTAL;
        tag = data && data.target;
    }
    else {
        // 兼容 Vue2 的对象式组件
        if (tag !== null && typeof tag === 'object') {
            flags = tag.functional
                ? VNodeFlags.COMPONENT_FUNCTIONAL // 函数式组件
                : VNodeFlags.COMPONENT_STATEFUL_NORMAL; // 有状态组件
        }
        else if (typeof tag === 'function') {
            // Vue3 的类组件
            flags = tag.prototype && tag.prototype.render
                ? VNodeFlags.COMPONENT_STATEFUL_NORMAL // 有状态组件
                : VNodeFlags.COMPONENT_FUNCTIONAL; // 函数式组件
        }
    }
    var childFlags = null;
    if (Array.isArray(children)) {
        var length_1 = children.length;
        if (length_1 === 0) {
            // 没有 children
            childFlags = ChildrenFlags.NO_CHILDREN;
        }
        else if (length_1 === 1) {
            // 单个子节点
            childFlags = ChildrenFlags.SINGLE_VNODE;
            children = children[0];
        }
        else {
            // 多个子节点，且子节点使用key
            childFlags = ChildrenFlags.KEYED_VNODES;
            children = normalizeVNodes(children);
        }
    }
    else if (children == null) {
        // 没有子节点
        childFlags = ChildrenFlags.NO_CHILDREN;
    }
    else if (children._isVNode) {
        // 单个子节点
        childFlags = ChildrenFlags.SINGLE_VNODE;
    }
    else {
        // 其他情况都作为文本节点处理，即单个子节点，会调用 createTextVNode 创建纯文本类型的 VNode
        childFlags = ChildrenFlags.SINGLE_VNODE;
        children = createTextVNode(children + '');
    }
    return {
        _isVNode: true,
        children: children,
        childFlags: childFlags,
        data: data,
        flags: flags,
        tag: tag,
        el: null
    };
}
