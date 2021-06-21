export const Fragment = Symbol()
export const Portal = Symbol()

export const VNodeFlags = {
    ELEMENT_HTML: 1,                                    // html 标签
    ELEMENT_SVG: 1 << 1,                                // SVG 标签
    COMPONENT_STATEFUL_NORMAL: 1 << 2,                  // 普通有状态组件
    COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE: 1 << 3,       // 需要被keepAlive的有状态组件
    COMPONENT_STATEFUL_KEPT_ALIVE: 1 << 4,              // 已经被keepAlive的有状态组件
    COMPONENT_FUNCTIONAL: 1 << 5,                       // 函数式组件
    TEXT: 1 << 6,                                       // 纯文本
    FRAGMENT: 1 << 7,                                   // Fragment
    PORTAL: 1 << 8,                                     // Portal
    ELEMENT: 0,                                         // html 和 svg 都是标签元素，可以用 ELEMENT 表示
    COMPONENT_STATEFUL: 0,                              // 有状态组件
    COMPONENT: 0,                                       // 组件
}

// html 和 svg 都是标签元素，可以用 ELEMENT 表示
VNodeFlags.ELEMENT = VNodeFlags.ELEMENT_HTML | VNodeFlags.ELEMENT_SVG
// 普通有状态组件、需要被keepAlive的有状态组件、已经被keepAlice的有状态组件 都是“有状态组件”，统一用 COMPONENT_STATEFUL 表示
VNodeFlags.COMPONENT_STATEFUL = VNodeFlags.COMPONENT_STATEFUL_NORMAL | VNodeFlags.COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE | VNodeFlags.COMPONENT_STATEFUL_KEPT_ALIVE
// 有状态组件 和  函数式组件都是“组件”，用 COMPONENT 表示
VNodeFlags.COMPONENT = VNodeFlags.COMPONENT_STATEFUL | VNodeFlags.COMPONENT_FUNCTIONAL

export const ChildrenFlags = {
    UNKNOWN_CHILDREN: 0,                // 未知的 children 类型
    NO_CHILDREN: 1,                     // 没有 children
    SINGLE_VNODE: 1 << 1,               // children 是单个 VNode
    KEYED_VNODES: 1 << 2,               // children 是多个拥有 key 的 VNode
    NONE_KEYED_VNODES: 1 << 3,          // children 是多个没有 key 的 VNode
    MULTIPLE_VNODES: 1 << 2 | 1 << 3,   // children 是多个
}

// children 是多个
ChildrenFlags.MULTIPLE_VNODES = ChildrenFlags.KEYED_VNODES | ChildrenFlags.NONE_KEYED_VNODES;

interface VNodeData<K> {
    style: CSSStyleDeclaration,
    class: string | Array<any>
    K: any
}


export interface VNode<K> {
    _isVNode: true,
    flags: FlagType,
    tag: String | VNode<K> | null | keyof HTMLElementTagNameMap | Function,
    data: VNodeData<K> | null,
    children: any,
    childFlags: number,
    handle: any,
    el: any,
    render: Function
}
