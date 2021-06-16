import {h} from './h'
import {Fragment} from "./VNode";
import {render} from "./render";

const fragmentVNode = h(Fragment, null, [
    h('td'), h('td')
]);

console.log(fragmentVNode)
console.log(h('你好吗', null, []))
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
            custom: 1
        })
    ]
)

render(elementVNode, document.getElementById('app'))
