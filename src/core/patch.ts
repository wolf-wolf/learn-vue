import {ChildrenFlags, VNode, VNodeFlags} from "./VNode";
import {mount} from "./mount";
import {patchChildren, patchData} from "./patchData";

function replaceVNode(prevVNode: VNode<any>, nextVNode: VNode<any>, container: Element) {
    // 将旧的 VNode 所渲染的 DOM 从容器中移除
    container.removeChild(prevVNode.el)
    // 如果将要被移除的 VNode 类型是组件，则需要调用该组件实例的 unmounted 钩子函数
    if ((prevVNode.flags as number) & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
        // 类型为有状态组件的 VNode，其 children 属性被用来存储组件实例对象
        const instance = prevVNode.children
        instance.unmounted && instance.unmounted()
    }
    // 再把新的 VNode 挂载到容器中
    mount(nextVNode, container)
}

function patchElement(prevVNode: VNode<any>, nextVNode: VNode<any>, container: Element) {
    // 如果新旧 VNode 描述的是不同的标签，则调用 replaceVNode 函数，使用新的 VNode 替换旧的 VNode
    if (prevVNode.tag !== nextVNode.tag) {
        replaceVNode(prevVNode, nextVNode, container)
        return
    }
    const el = (nextVNode.el = prevVNode.el);       // 拿到 el 元素，注意这时要让 nextVNode.el 也引用该元素
    const prevData = prevVNode.data as any;                // 拿到 新旧 VNodeData
    const nextData = nextVNode.data as any;

    // 新的 VNodeData 存在时才有必要更新
    if (nextData) {
        // 遍历新的 VNodeData，将旧值和新值都传递给 patchData 函数
        for (let key in nextData) {
            const prevValue = prevData[key]
            const nextValue = nextData[key]
            patchData(el, key, prevValue, nextValue)
        }
    }
    if (prevData) {
        // 遍历旧的 VNodeData，将已经不存在于新的 VNodeData 中的数据移除
        for (let key in prevData) {
            const prevValue = prevData[key]
            if (prevValue && !nextData.hasOwnProperty(key)) {
                // 第四个参数为 null，代表移除数据
                patchData(el, key, prevValue, null)
            }
        }
    }

    // 调用 patchChildren 函数递归地更新子节点
    patchChildren(
        prevVNode.childFlags, // 旧的 VNode 子节点的类型
        nextVNode.childFlags, // 新的 VNode 子节点的类型
        prevVNode.children,   // 旧的 VNode 子节点
        nextVNode.children,   // 新的 VNode 子节点
        el                    // 当前标签元素，即这些子节点的父节点
    )
}

function patchComponent(prevVNode: VNode<any>, nextVNode: VNode<any>, container: Element) {
    // tag 属性的值是组件类，通过比较新旧组件类是否相等来判断是否是相同的组件
    if (nextVNode.tag !== prevVNode.tag) {
        replaceVNode(prevVNode, nextVNode, container)
    } else if ((nextVNode.flags as number) & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {   // 检查组件是否是有状态组件
        // 1、获取组件实例
        const instance = (nextVNode.children = prevVNode.children)
        // 2、更新 props
        instance.$props = nextVNode.data
        // 3、更新组件
        instance._update()
    }
}

function patchText(prevVNode: VNode<any>, nextVNode: VNode<any>) {
    // 拿到文本元素 el，同时让 nextVNode.el 指向该文本元素
    const el = (nextVNode.el = prevVNode.el)
    // 只有当新旧文本内容不一致时才有必要更新
    if (nextVNode.children !== prevVNode.children) {
        el.nodeValue = nextVNode.children
    }
}

function patchFragment(prevVNode: VNode<any>, nextVNode: VNode<any>, container: Element) {
    // 直接调用 patchChildren 函数更新 新旧片段的子节点即可
    patchChildren(
        prevVNode.childFlags, // 旧片段的子节点类型
        nextVNode.childFlags, // 新片段的子节点类型
        prevVNode.children,   // 旧片段的子节点
        nextVNode.children,   // 新片段的子节点
        container
    )

    switch (nextVNode.childFlags) {
        case ChildrenFlags.SINGLE_VNODE:
            nextVNode.el = nextVNode.children.el
            break
        case ChildrenFlags.NO_CHILDREN:
            nextVNode.el = prevVNode.el
            break
        default:
            nextVNode.el = nextVNode.children[0].el
    }
}

function patchPortal(prevVNode: VNode<any>, nextVNode: VNode<any>) {
    patchChildren(
        prevVNode.childFlags,
        nextVNode.childFlags,
        prevVNode.children,
        nextVNode.children,
        prevVNode.tag as any // 注意容器元素是旧的 container
    )

    // 让 nextVNode.el 指向 prevVNode.el
    nextVNode.el = prevVNode.el;

    // 如果新旧容器不同，才需要搬运
    if (nextVNode.tag !== prevVNode.tag) {
        // 获取新的容器元素，即挂载目标
        const container = (typeof nextVNode.tag === 'string' ? document.querySelector(nextVNode.tag) : nextVNode.tag) as any;

        switch (nextVNode.childFlags) {
            case ChildrenFlags.SINGLE_VNODE:
                // 如果新的 Portal 是单个子节点，就把该节点搬运到新容器中
                container.appendChild(nextVNode.children.el)
                break
            case ChildrenFlags.NO_CHILDREN:
                // 新的 Portal 没有子节点，不需要搬运
                break
            default:
                // 如果新的 Portal 是多个子节点，遍历逐个将它们搬运到新容器中
                for (let i = 0; i < nextVNode.children.length; i++) {
                    container.appendChild(nextVNode.children[i].el)
                }
                break
        }
    }
}

export function patch(prevVNode: VNode<any>, nextVNode: VNode<any>, container: Element) {
    // 分别拿到新旧 VNode 的类型，即 flags
    const nextFlags = nextVNode.flags
    const prevFlags = prevVNode.flags

    // 检查新旧 VNode 的类型是否相同，如果类型不同，则直接调用 replaceVNode 函数替换 VNode
    // 如果新旧 VNode 的类型相同，则根据不同的类型调用不同的比对函数
    if (prevFlags !== nextFlags) {
        replaceVNode(prevVNode, nextVNode, container)
    } else if ((nextFlags as number) & VNodeFlags.ELEMENT) {
        patchElement(prevVNode, nextVNode, container)
    } else if ((nextFlags as number) & VNodeFlags.COMPONENT) {
        patchComponent(prevVNode, nextVNode, container)
    } else if ((nextFlags as number) & VNodeFlags.TEXT) {
        patchText(prevVNode, nextVNode)
    } else if ((nextFlags as number) & VNodeFlags.FRAGMENT) {
        patchFragment(prevVNode, nextVNode, container)
    } else if ((nextFlags as number) & VNodeFlags.PORTAL) {
        patchPortal(prevVNode, nextVNode)
    }
}
