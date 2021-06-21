// 子组件 - 函数式组件
import {render} from "../core/render";
import {h} from "../core/h";

function MyFunctionalComp(props: any) {
    return h('div', null, props.text)
}

// 父组件的 render 函数中渲染了 MyFunctionalComp 子组件
class ParentComponent {
    localState = 'one'

    mounted() {
        setTimeout(() => {
            this.localState = 'two';
            (this as any)._update()
        }, 2000)
    }

    render() {
        return h(MyFunctionalComp, {
            text: this.localState
        })
    }
}

// 有状态组件 VNode
const compVNode = h(ParentComponent)
render(compVNode, document.getElementById('app'))
