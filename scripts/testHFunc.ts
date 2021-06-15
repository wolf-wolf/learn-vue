import {h} from './h'
import {Fragment} from "./VNode";

const fragmentVNode = h(Fragment, null, [
    h('td'), h('td')
]);

console.log(fragmentVNode)
console.log(h('你好吗', null, []))