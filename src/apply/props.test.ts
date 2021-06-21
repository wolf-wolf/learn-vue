// 子组件类
import {render} from "../core/render";
import {h} from "../core/h";

class ChildComponent {
    render() {
        // 子组件中访问外部状态：this.$props.text
        return h('div', null, (this as any).$props.text)
    }
}

// 父组件类
class ParentComponent {
    localState = 'one'

    mounted() {
        // 两秒钟后将 localState 的值修改为 'two'
        setTimeout(() => {
            this.localState = 'two';

            (this as any)._update()
        }, 2000)
    }

    render() {
        return h(ChildComponent, {
            // 父组件向子组件传递的 props
            text: this.localState
        })
    }
}

export default function PropsTest() {
    // 有状态组件 VNode
    const compVNode = h(ParentComponent)
    render(compVNode, document.getElementById('app'))

}
