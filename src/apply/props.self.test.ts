// 父组件渲染不同的子组件
import {render} from "../core/render";
import {h} from "../core/h";

class ChildComponent1 {
    render() {
        // 子组件中访问外部状态：this.$props.text
        return h('div', null, (this as any).$props.text)
    }
}

class ChildComponent2 {
    render() {
        // 子组件中访问外部状态：this.$props.text
        return h('div', null, (this as any).$props.text)
    }
}

// 父组件类
class ParentComponent {
    isTrue = false;

    mounted() {
        // 两秒钟后将 localState 的值修改为 'two'
        setTimeout(() => {
            this.isTrue = true;

            (this as any)._update()
        }, 2000)
    }

    render() {
        return this.isTrue ? h(ChildComponent1, {
            // 父组件向子组件传递的 props
            text: 'ChildComponent-1'
        }) : h(ChildComponent2, {
            // 父组件向子组件传递的 props
            text: 'ChildComponent-2'
        })
    }
}

export default function PropsSelfTest() {
    // 有状态组件 VNode
    const compVNode = h(ParentComponent)
    render(compVNode, document.getElementById('app'))
}
