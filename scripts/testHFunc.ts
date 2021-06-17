import {h} from './h'
import {Fragment, Portal} from "./VNode";
import {render} from "./render";
import MyComponent from "./funcComp.test";
import MyFunctionalComponent from "./classComp.test";

const fragmentVNode = h(Fragment, null, [
    h('td'), h('td')
]);

console.log(fragmentVNode)
console.log(h('你好吗', null, []))

function handler() {
    alert('click me')
}

const elementVNode = h(
    'div',
    {
        style: {
            height: '100px',
            width: '100px',
            background: 'red'
        }
    },
    [
        // 测试 class组件 的渲染
        h(MyComponent),
        // 测试 函数组件 的渲染
        h(MyFunctionalComponent),
        // 测试 class 的渲染
        h('div', {
            style: {
                height: '50px',
                width: '50px',
                background: 'green'
            },
            class: [
                'class-a',
                ['class-e', 'class-f'],
                {
                    'class-b': true,
                    'class-c': true
                }
            ]
        }),
        // 测试 自定义属性 的渲染
        h('input', {
            type: 'checkbox',
            class: 'test-1',
            checked: true,
            custom: 1,
        }),
        // 测试 事件 的渲染
        h('div', {
            style: {
                height: '50px',
                width: '50px',
                background: 'green'
            },
            onclick: handler
        }),
        // 测试 文本 的渲染
        h('div', {
                style: {
                    height: '100px',
                    width: '100px',
                    background: 'red'
                }
            },
            '我是文本'
        ),
        // 测试 Fragment 的渲染
        h(Fragment, null, [
            h('span', null, '我是标题1......'),
            h('span', null, '我是标题2......')
        ]),

        // 测试 Portal 的渲染
        h(Portal, {target: '#app11'}, [
            h('span', null, '我是 Portal 标题1......'),
            h('span', null, '我是 Portal 标题2......')
        ])
    ]
)

render(elementVNode, document.getElementById('app'))
