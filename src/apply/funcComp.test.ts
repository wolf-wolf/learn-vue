import {h} from "../core/h";

export default class MyComponent {
    render() {
        return h(
            'div',
            {
                style: {
                    background: 'green'
                }
            },
            [
                h('span', null, '我是组件的标题1......'),
                h('span', null, '我是组件的标题2......')
            ]
        )
    }
}

