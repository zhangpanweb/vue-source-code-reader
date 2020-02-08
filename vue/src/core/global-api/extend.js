/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   * 类继承方法，调用 baseCtor.extend(Ctor)
   * 接受一个 extendOptions 对象，返回一个 子类构造函数
   */
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    const Super = this // 暂存现在的类为超类
    const SuperId = Super.cid
    // 对同一个 extendOptions，如果之前有缓存的结果，则直接通过 Super.cid 获取缓存的结果
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) { // 如果存在缓存，直接返回
      return cachedCtors[SuperId]
    }

    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      validateComponentName(name)
    }

    const Sub = function VueComponent (options) {
      this._init(options) // Vue组件的构造函数，内部调用 _init 方法进行初始化
    }
    Sub.prototype = Object.create(Super.prototype) // 设置继承指向
    Sub.prototype.constructor = Sub // 恢复 constructor 指向
    Sub.cid = cid++ // 设置 cid
    Sub.options = mergeOptions( // 合并 Super 的 options 和传入的 options
      Super.options,
      extendOptions
    )
    Sub['super'] = Super // 将 Super 挂载再 Sub 的 super 属性上

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps(Sub) // 初始化属性
    }
    if (Sub.options.computed) {
      initComputed(Sub) // 初始化构造属性
    }

    // allow further extension/mixin/plugin usage
    // 扩展 Sub 的静态方法
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    cachedCtors[SuperId] = Sub // 缓存 Sub
    return Sub
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
