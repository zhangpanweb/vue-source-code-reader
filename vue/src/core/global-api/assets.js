/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => { // 将 ASSET_TYPES 中的方法挂载在 Vue 上
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }
        if (type === 'component' && isPlainObject(definition)) { // 如果调用 Vue.component，并传入普通对象作为定义
          definition.name = definition.name || id
          definition = this.options._base.extend(definition) // 通过 _base.extend 构造一个 Vue子类构造器
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        this.options[type + 's'][id] = definition // 将对应内容挂载再 Vue.options 上面
        return definition
      }
    }
  })
}
