import {ChildrenFlags, VNode, VNodeFlags} from "./VNode";
import {createTextVNode, domPropsRE, normalizeClass} from "./utils";
import {patch} from "./patch";

/**
 * 渲染普通的HTML标签
 * @param vnode
 * @param container
 * @param isSVG
 */
function mountElement(vnode: VNode<any>, container: Element, isSVG: boolean): void {
    isSVG = isSVG || !!((vnode.flags as number) & VNodeFlags.ELEMENT_SVG);
    const el = isSVG
        ? document.createElementNS('http://www.w3.org/2000/svg', vnode.tag as keyof HTMLElementTagNameMap)
        : document.createElement(vnode.tag as keyof HTMLElementTagNameMap)

    // 拿到 VNodeData
    const data = vnode.data

    if (data) {
        // 如果 VNodeData 存在，则遍历之
        for (let key in data) {
            // key 可能是 class、style、on 等等
            switch (key) {
                case 'style':
                    // 如果 key 的值是 style，说明是内联样式，逐个将样式规则应用到 el
                    for (let k in data.style) {
                        el.style[k] = data.style[k]
                    }
                    break;
                case 'class':
                    if (isSVG) {
                        el.setAttribute('class', data[key] as string)
                    } else {
                        (el as any).className = normalizeClass(data[key])
                    }

                    break
                default:
                    let handle = (data as any)[key] as any;
                    if (key[0] === 'o' && key[1] === 'n') {
                        // 事件
                        el.addEventListener(key.slice(2), handle)
                    } else if (domPropsRE.test(key)) {
                        (el as any)[key] = handle           // 当作 DOM Prop 处理
                    } else {
                        // 当作 Attr 处理
                        el.setAttribute(key, handle)
                    }
                    break
            }
        }
    }

    vnode.el = el;

    // 递归挂载子节点
    // 拿到 children 和 childFlags
    const childFlags = vnode.childFlags;
    const children = vnode.children as any;

    // 检测如果没有子节点则无需递归挂载
    if (childFlags !== ChildrenFlags.NO_CHILDREN) {
        if (childFlags & ChildrenFlags.SINGLE_VNODE) {
            // 如果是单个子节点则调用 mount 函数挂载
            mount((children as VNode<any>), el, isSVG)
        } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
            // 如果是单多个子节点则遍历并调用 mount 函数挂载
            for (let i = 0; i < children.length; i++) {
                mount(children[i], el, isSVG)
            }
        }
    }

    container.appendChild(el);
}

/**
 * 渲染有状态组件
 * @param vnode
 * @param container
 * @param isSVG
 */
function mountStatefulComponent(vnode: VNode<any>, container: Element, isSVG: boolean): void {
    // 创建组件实例
    const instance = (vnode.children = new (vnode.tag as any)())

    // 初始化 props
    instance.$props = vnode.data

    console.log('instance', instance)

    instance._update = function () {
        // 如果 instance._mounted 为真，说明组件已挂载，应该执行更新操作
        if (instance._mounted) {
            // 1、拿到旧的 VNode
            const prevVNode = instance.$vnode
            // 2、重渲染新的 VNode
            const nextVNode = (instance.$vnode = instance.render())
            // 3、patch 更新
            patch(prevVNode, nextVNode, prevVNode.el.parentNode)
            // 4、更新 vnode.el 和 $el
            instance.$el = vnode.el = instance.$vnode.el
        } else {
            // 1、渲染VNode
            instance.$vnode = instance.render()
            // 2、挂载
            mount(instance.$vnode, container, isSVG)
            // 3、组件已挂载的标识
            instance._mounted = true
            // 4、el 属性值 和 组件实例的 $el 属性都引用组件的根DOM元素
            instance.$el = vnode.el = instance.$vnode.el
            // 5、调用 mounted 钩子
            instance.mounted && instance.mounted()
        }
    }

    instance._update()
}

function mountFunctionalComponent(vnode: VNode<any>, container: Element, isSVG: boolean): void {
    // 在函数式组件类型的 vnode 上添加 handle 属性，它是一个对象
    vnode.handle = {
        prev: null,
        next: vnode,
        container,
        update: () => {
            if (vnode.handle.prev) {
                // 更新的逻辑写在这里
                // prevVNode 是旧的组件VNode，nextVNode 是新的组件VNode
                const prevVNode = vnode.handle.prev
                const nextVNode = vnode.handle.next
                // prevTree 是组件产出的旧的 VNode
                const prevTree = prevVNode.children
                // 更新 props 数据
                const props = nextVNode.data
                // nextTree 是组件产出的新的 VNode
                const nextTree = (nextVNode.children = nextVNode.tag(props))
                // 调用 patch 函数更新
                patch(prevTree, nextTree, vnode.handle.container)
            } else {
                // 获取 props
                const props = vnode.data
                // 获取 VNode
                const $vnode = (vnode.children = (vnode.tag as Function)(props))
                // 挂载
                mount($vnode, container, isSVG)
                // el 元素引用该组件的根元素
                vnode.el = $vnode.el
            }
        }
    }

    // 立即调用 vnode.handle.update 完成初次挂载
    vnode.handle.update()
}

function mountComponent(vnode: VNode<any>, container: Element, isSVG: boolean): void {
    if ((vnode.flags as number) & VNodeFlags.COMPONENT_STATEFUL) {
        mountStatefulComponent(vnode, container, isSVG)
    } else {
        mountFunctionalComponent(vnode, container, isSVG)
    }
}

function mountText(vnode: VNode<any>, container: Element) {
    const el = document.createTextNode(vnode.children)
    vnode.el = el
    container.appendChild(el)
}

function mountFragment(vnode: VNode<any>, container: Element, isSVG: boolean): void {
    // 拿到 children 和 childFlags
    const {children, childFlags} = vnode
    switch (childFlags) {
        case ChildrenFlags.SINGLE_VNODE:
            // 如果是单个子节点，则直接调用 mount
            mount(children, container, isSVG)
            // 单个子节点，就指向该节点
            vnode.el = children.el
            break
        case ChildrenFlags.NO_CHILDREN:
            // 如果没有子节点，等价于挂载空片段，会创建一个空的文本节点占位
            const placeholder = createTextVNode('')
            mountText(placeholder, container)
            // 没有子节点指向占位的空文本节点
            vnode.el = placeholder.el
            break
        default:
            // 多个子节点，遍历挂载之
            for (let i = 0; i < children.length; i++) {
                mount(children[i], container, isSVG)
            }
            // 多个子节点，指向第一个子节点
            vnode.el = children[0].el
    }
}

function mountPortal(vnode: VNode<any>, container: Element) {
    const {tag, children, childFlags} = vnode

    // 获取挂载点
    let target = (typeof tag === 'string' ? document.querySelector(tag) : tag) as Element;

    if (!target) {
        console.warn(`将要挂在的元素 ${tag} 不存在，默认挂载在父级元素下...`)
        target = container;
    }

    if (childFlags & ChildrenFlags.SINGLE_VNODE) {
        // 将 children 挂载到 target 上，而非 container
        mount(children, target)
    } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
        for (let i = 0; i < children.length; i++) {
            // 将 children 挂载到 target 上，而非 container
            mount(children[i], target)
        }
    }

    // 占位的空文本节点
    const placeholder = createTextVNode('')
    // 将该节点挂载到 container 中
    mountText(placeholder, container)
    // el 属性引用该节点
    vnode.el = placeholder.el
}

export function mount(vnode: VNode<any>, container: Element, isSVG: boolean = false): void {
    const flags = vnode.flags as number;

    if (flags & VNodeFlags.ELEMENT) {
        // 挂载普通标签
        mountElement(vnode, container, isSVG)
    } else if (flags & VNodeFlags.COMPONENT) {
        // 挂载组件
        mountComponent(vnode, container, isSVG)
    } else if (flags & VNodeFlags.TEXT) {
        // 挂载纯文本
        mountText(vnode, container)
    } else if (flags & VNodeFlags.FRAGMENT) {
        // 挂载 Fragment
        mountFragment(vnode, container, isSVG)
    } else if (flags & VNodeFlags.PORTAL) {
        // 挂载 Portal
        mountPortal(vnode, container)
    }
}
