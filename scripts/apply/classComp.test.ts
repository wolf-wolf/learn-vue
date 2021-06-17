import {h} from "./h";

export default function MyFunctionalComponent() {
    // 返回要渲染的内容描述，即 VNode
    return h(
        'div',
        {
            style: {
                background: 'green'
            }
        },
        [
            h('span', null, '我是函数组件的标题1......'),
            h('span', null, '我是函数组件的标题2......')
        ]
    )
}

