import {h} from './h'
import {Fragment, Portal} from "./VNode";
import {render} from "./render";

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
        h('input', {
            type: 'checkbox',
            class: 'test-1',
            checked: true,
            custom: 1,
        }),
        h('div', {
            style: {
                height: '50px',
                width: '50px',
                background: 'green'
            },
            onclick: handler
        }),
        h(
            'div',
            {
                style: {
                    height: '100px',
                    width: '100px',
                    background: 'red'
                }
            },
            '我是文本'
        ),
        h(Fragment, null, [
            h('span', null, '我是标题1......'),
            h('span', null, '我是标题2......')
        ]),

        h(Portal, { target: '#app11' }, [
            h('span', null, '我是 Portal 标题1......'),
            h('span', null, '我是 Portal 标题2......')
        ])
    ]
)

render(elementVNode, document.getElementById('app'))
