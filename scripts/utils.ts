export function normalizeVNodes(children: any) {
    const newChildren = []
    // 遍历 children
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (child.key == null) {
            // 如果原来的 VNode 没有key，则使用竖线(|)与该VNode在数组中的索引拼接而成的字符串作为key
            child.key = '|' + i
        }
        newChildren.push(child)
    }
    // 返回新的children，此时 children 的类型就是 ChildrenFlags.KEYED_VNODES
    return newChildren
}

export function normalizeClass(classValue: any) {
    // res 是最终要返回的类名字符串
    let res = ''
    if (typeof classValue === 'string') {
        res = classValue
    } else if (Array.isArray(classValue)) {
        for (let i = 0; i < classValue.length; i++) {
            res += normalizeClass(classValue[i]) + ' '
        }
    } else if (typeof classValue === 'object') {
        for (const name in classValue) {
            if (classValue[name]) {
                res += name + ' '
            }
        }
    }
    return res.trim()
}
