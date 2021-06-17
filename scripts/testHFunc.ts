import {h} from './h'
import {Fragment, Portal} from "./VNode";
import {render} from "./render";
import MyComponent from "./funcComp.test";
import MyFunctionalComponent from "./classComp.test";

function testEleRender() {

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
}

function testReplace() {
    // 旧的 VNode 是一个 div 标签
    const prevVNode = h('div', null, '旧的 VNode')

    class MyComponent {
        render() {
            return h('h1', null, '新的 VNode')
        }
    }

    // 新的 VNode 是一个组件
    const nextVNode = h(MyComponent)

    // 先后渲染新旧 VNode 到 #app
    render(prevVNode, document.getElementById('app'))
    setTimeout(() => {
        render(nextVNode, document.getElementById('app'))
    }, 2000)
}

function testPatchElement() {
    // 旧的 VNode
    const prevVNode = h('div', {
        style: {
            width: '100px',
            height: '100px',
            backgroundColor: 'red'
        }
    })

// 新的 VNode
    const nextVNode = h('div', {
        style: {
            width: '100px',
            height: '100px',
            border: '1px solid green'
        }
    })

    // 先后渲染新旧 VNode 到 #app
    render(prevVNode, document.getElementById('app'))
    setTimeout(() => {
        render(nextVNode, document.getElementById('app'))
    }, 2000)
}

// 新旧节点都有一个子节点
function testPatchDataSvsS() {
    // 旧的 VNode
    const prevVNode = h('div', null,
        h('p', {
            style: {
                height: '100px',
                width: '100px',
                background: 'red'
            }
        })
    )

// 新的 VNode
    const nextVNode = h('div', null,
        h('p', {
            style: {
                height: '100px',
                width: '100px',
                background: 'green'
            }
        })
    )

    render(prevVNode, document.getElementById('app'))

// 2秒后更新
    setTimeout(() => {
        render(nextVNode, document.getElementById('app'))
    }, 2000)
}

function testPatchDataSvsM() {
    // 旧的 VNode
    const prevVNode = h('div', null, h('p', null, '只有一个子节点'))

// 新的 VNode
    const nextVNode = h('div', null, [
        h('p', null, '子节点 1'),
        h('p', null, '子节点 2')
    ])

    render(prevVNode, document.getElementById('app'))

// 2秒后更新
    setTimeout(() => {
        render(nextVNode, document.getElementById('app'))
    }, 2000)
}

function testPatchDataSvsN() {
    // 旧的 VNode
    const prevVNode = h(
        'div',
        null,
        // h('p', {
        //     style: {
        //         height: '100px',
        //         width: '100px',
        //         background: 'red'
        //     }
        // })
        // 测试 Fragment 的渲染
        h(Fragment, null, [
            h('span', null, '我是标题1......'),
            h('span', null, '我是标题2......')
        ]),
    )

// 新的 VNode
    const nextVNode = h('div')

    render(prevVNode, document.getElementById('app'))

// 2秒后更新
    setTimeout(() => {
        render(nextVNode, document.getElementById('app'))
    }, 2000)
}

testPatchDataSvsM()
