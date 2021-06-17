import {ChildrenFlags, Fragment, Portal, VNode, VNodeFlags} from "./VNode";
import {createTextVNode, normalizeVNodes} from "./utils";

export function h(tag: any, data: any = null, children: any = null): VNode<any> {
    let flags = null
    if (typeof tag === 'string') {
        flags = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML
    } else if (tag === Fragment) {
        flags = VNodeFlags.FRAGMENT
    } else if (tag === Portal) {
        flags = VNodeFlags.PORTAL
        tag = data && data.target
    } else {
        // 兼容 Vue2 的对象式组件
        if (tag !== null && typeof tag === 'object') {
            flags = tag.functional
                ? VNodeFlags.COMPONENT_FUNCTIONAL       // 函数式组件
                : VNodeFlags.COMPONENT_STATEFUL_NORMAL  // 有状态组件
        } else if (typeof tag === 'function') {
            // Vue3 的类组件
            flags = tag.prototype && tag.prototype.render
                ? VNodeFlags.COMPONENT_STATEFUL_NORMAL  // 有状态组件
                : VNodeFlags.COMPONENT_FUNCTIONAL       // 函数式组件
        }
    }

    let childFlags = null
    if (Array.isArray(children)) {
        const {length} = children
        if (length === 0) {
            // 没有 children
            childFlags = ChildrenFlags.NO_CHILDREN
        } else if (length === 1) {
            // 单个子节点
            childFlags = ChildrenFlags.SINGLE_VNODE
            children = children[0]
        } else {
            // 多个子节点，且子节点使用key
            childFlags = ChildrenFlags.KEYED_VNODES
            children = normalizeVNodes(children)
        }
    } else if (children == null) {
        // 没有子节点
        childFlags = ChildrenFlags.NO_CHILDREN
    } else if (children._isVNode) {
        // 单个子节点
        childFlags = ChildrenFlags.SINGLE_VNODE
    } else {
        // 其他情况都作为文本节点处理，即单个子节点，会调用 createTextVNode 创建纯文本类型的 VNode
        childFlags = ChildrenFlags.SINGLE_VNODE
        children = createTextVNode(children + '')
    }

    return {
        _isVNode: true,
        children,
        childFlags,
        data,
        flags,
        tag,
        el: null,
        render: () => {
        }
    }
}

