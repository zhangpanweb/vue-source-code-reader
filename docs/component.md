## 组件mount

### 实例代码
```javascript
// main.js
import App from './App.vue'

var app = new Vue({
  el: '#app',
  // 这里的 h 是 createElement 方法
  render: h => h(App)
})
```

```vue
<template>
  <div>
    {{ message }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello'
    };
  },
};
</script>
```

### 分析

- 最开始调用最外层，new Vue 实例化最外层的 Vue，创建最外层的 Vue 实例，然后进行 mount，到 mountComponent，到 `vm._update(vm._render(), hydrating)`，此时 `vm` 对应的是最外层的 Vue 实例
  - 通过 `vm._render()` 调用 `h => h(App)` 创建 vnode，此 vnode 对应于 `App`组件这一层，其 `tag` 属性为 `vue-component-1`
  - 通过 `vm._update()` 进行 DOM 挂载，调用 `patch`，其参数中，`oldVnode` 是 `<div id="app"></div>` 对应的 DOM，vnode 为 `vue-component-1` 这个 vnode
  - `patch` 中，到 `createElm()` 中，走到 `createComponent()`，进入下一层级，即 `App` 这层的实例化
    - 在 `createComponent()` 调用 `init` 钩子函数，在 `init` 中调用 `createComponentInstanceForVnode` 创建 `App` 组件的实例，也就是 `vue-component-1` 这个实例，将此实例赋值给 `vnode.componentInstance` 和 `child`，然后调用 `child.$mount()` 进行这个实例的挂载
      - 同样走到 `vm._update(vm._render(), hydrating)`，此时 `vm` 即为 `vue-component-1` 这个实例
      - 调用 `vm._render()` 会执行 `<template>` 中的模板编译成的 `render` 函数，生成对应的 vnode，这个 vnode 是 `div` 层级的，其父 vnode 是 `vue-component-1` 对应的 vnode
      - 然后调用 `vm._update()` 进行 `div` 层级 vnode 的 `patch`，再次走到 `patch` 方法中，此时 `oldVnode` 为 `undefined`，vnode 即为 `div` 层 vnode
      - 对 `div` 层 vnode 的 `patch` 执行实际 DOM 操作，将 DOM 操作结果挂载在 vnode 的 `elm` 属性中，此次 `patch` 结束后，这个 `vnode` 的 `elm` 属性变为 `<div>Hello</div>` 的 DOM，`patch` 执行的结果会赋值给 `vm.$el`
      - 至此 `vue-component-1` 实例的 `patch` 完成，`vue-component-1` 的挂载也完成，`child.$mount()` 完成，`child` 的 `_vnode` 属性中挂载这 `div` 层级的 vnode
    - `child.$mount()` 执行完毕后，`vnode.componentInstance` 中存放的即为 `vue-component-1` 实例，其 `$el` 属性即为实际 `App` 组件对应的 DOM
    - 继续往下到 `initComponent(vnode, insertedVnodeQueue)` 函数调用中，将 `vnode.componentInstance.$el` 赋值给 `vnode.elm`
    - 然后调用 `insert(parentElm, vnode.elm, refElm)` 将 `vnode.elm` 插入到 `parentElm` 中，整体的 `App` DOM 便插入到了实际的文档中

### 数据结构

- vnode
  - componentInstance，存放此 vnode 对应生成的 Vue 实例
  - elm，此 vnode 对应的实际 DOM，patch 主要进行对 elm 的操作
  - 

- Vue 实例
  - $el，存放此实例对应的 DOM
  - _vnode，此实例对应的 vnode
