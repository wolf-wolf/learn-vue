import {ChildrenFlags, VNode, VNodeFlags} from "./VNode";
import {createTextVNode, domPropsRE, normalizeClass} from "./utils";
import {patch} from "./patch";

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
                        // @ts-ignore
                        el.className = normalizeClass(data[key])
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

function mountStatefulComponent(vnode: VNode<any>, container: Element, isSVG: boolean): void {
    // 创建组件实例
    const instance = new (vnode.tag as any)()
    // 渲染VNode
    instance.$vnode = instance.render()
    // 挂载
    mount(instance.$vnode, container, isSVG)
    // el 属性值 和 组件实例的 $el 属性都引用组件的根DOM元素
    instance.$el = vnode.el = instance.$vnode.el
}

function mountFunctionalComponent(vnode: VNode<any>, container: Element, isSVG: boolean): void {
    // 获取 VNode
    const $vnode = (vnode.tag as any)()
    // 挂载
    mount($vnode, container, isSVG)
    // el 元素引用该组件的根元素
    vnode.el = $vnode.el
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

export function render(vnode: VNode<any>, container: any) {
    const prevVNode = container.vnode
    if (prevVNode == null) {
        if (vnode) {
            // 没有旧的 VNode，只有新的 VNode。使用 `mount` 函数挂载全新的 VNode
            mount(vnode, container)
            // 将新的 VNode 添加到 container.vnode 属性下，这样下一次渲染时旧的 VNode 就存在了
            container.vnode = vnode
        }
    } else {
        if (vnode) {
            // 有旧的 VNode，也有新的 VNode。则调用 `patch` 函数打补丁
            patch(prevVNode, vnode, container)
            // 更新 container.vnode
            container.vnode = vnode
        } else {
            // 有旧的 VNode 但是没有新的 VNode，这说明应该移除 DOM，在浏览器中可以使用 removeChild 函数。
            container.removeChild(prevVNode.el)
            container.vnode = null
        }
    }
}
