import {domPropsRE} from "./utils";
import {ChildrenFlags, VNodeFlags} from "./VNode";
import {patch} from "./patch";
import {mount} from "./render";

export function patchData(el: any, key: string, prevValue: any, nextValue: any) {
    switch (key) {
        case 'style':
            for (let k in nextValue) {
                el.style[k] = nextValue[k]
            }
            for (let k in prevValue) {
                if (!nextValue.hasOwnProperty(k)) {
                    el.style[k] = ''
                }
            }
            break
        case 'class':
            el.className = nextValue
            break
        default:
            if (key[0] === 'o' && key[1] === 'n') {
                // 事件
                // 移除旧事件
                if (prevValue) {
                    el.removeEventListener(key.slice(2), prevValue)
                }
                // 添加新事件
                if (nextValue) {
                    el.addEventListener(key.slice(2), nextValue)
                }
            } else if (domPropsRE.test(key)) {
                // 当作 DOM Prop 处理
                el[key] = nextValue
            } else {
                // 当作 Attr 处理
                el.setAttribute(key, nextValue)
            }
            break
    }
}

function removeChildren(prevChildren: any, container: Element) {
    // 判断是否为 Fragment
    if (prevChildren.flags & VNodeFlags.FRAGMENT) {
        prevChildren.children.forEach((item: any) => {
            container.removeChild(item.el)
        })
    } else {
        container.removeChild(prevChildren.el)
    }
}

export function patchChildren(
    prevChildFlags: FlagType,
    nextChildFlags: FlagType,
    prevChildren: any,
    nextChildren: any,
    container: Element
) {
    switch (prevChildFlags) {
        // 旧的 children 是单个子节点，会执行该 case 语句块
        case ChildrenFlags.SINGLE_VNODE:
            switch (nextChildFlags) {
                case ChildrenFlags.SINGLE_VNODE:
                    // 新的 children 也是单个子节点时，会执行该 case 语句块
                    // 此时 prevChildren 和 nextChildren 都是 VNode 对象
                    patch(prevChildren, nextChildren, container)
                    break
                case ChildrenFlags.NO_CHILDREN:
                    // 新的 children 中没有子节点时，会执行该 case 语句块
                    removeChildren(prevChildren, container);
                    break
                default:
                    // 新的 children 中有多个子节点时，会执行该 case 语句块
                    removeChildren(prevChildren, container);
                    // 遍历新的多个子节点，逐个挂载到容器中
                    for (let i = 0; i < nextChildren.length; i++) {
                        mount(nextChildren[i], container)
                    }
                    break
            }
            break
        // 旧的 children 中没有子节点时，会执行该 case 语句块
        case ChildrenFlags.NO_CHILDREN:
            switch (nextChildFlags) {
                case ChildrenFlags.SINGLE_VNODE:
                    // 新的 children 是单个子节点时，会执行该 case 语句块
                    // 使用 mount 函数将新的子节点挂载到容器元素
                    mount(nextChildren, container)
                    break
                case ChildrenFlags.NO_CHILDREN:
                    // 新的 children 中没有子节点时，会执行该 case 语句块
                    // 什么都不做
                    break
                default:
                    // 新的 children 中有多个子节点时，会执行该 case 语句块
                    // 遍历多个新的子节点，逐个使用 mount 函数挂载到容器元素
                    for (let i = 0; i < nextChildren.length; i++) {
                        mount(nextChildren[i], container)
                    }
                    break
            }
            break
        // 旧的 children 中有多个子节点时，会执行该 case 语句块
        default:
            switch (nextChildFlags) {
                case ChildrenFlags.SINGLE_VNODE:
                    for (let i = 0; i < prevChildren.length; i++) {
                        removeChildren(prevChildren[i], container);
                    }
                    mount(nextChildren, container)
                    break
                case ChildrenFlags.NO_CHILDREN:
                    for (let i = 0; i < prevChildren.length; i++) {
                        removeChildren(prevChildren[i], container);
                    }
                    break
                default:
                    // 新的 children 中有多个子节点时，会执行该 case 语句块
                    // fixme 临时方案，后续核心diff算法
                    // 遍历旧的子节点，将其全部移除
                    for (let i = 0; i < prevChildren.length; i++) {
                        removeChildren(prevChildren[i], container);
                    }
                    // 遍历新的子节点，将其全部添加
                    for (let i = 0; i < nextChildren.length; i++) {
                        mount(nextChildren[i], container)
                    }
                    break
            }
            break
    }
}
