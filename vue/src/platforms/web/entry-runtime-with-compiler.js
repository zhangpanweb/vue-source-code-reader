/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

const mount = Vue.prototype.$mount // 缓存 mount 方法
Vue.prototype.$mount = function ( // 重写 mount 方法
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el) // 获取挂载元素

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) { // 限制 Vue 被挂载在 body、html 等根节点上
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this // 返回 Vue 实例
  }

  const options = this.$options // 获取 options
  // resolve template/el and convert to render function
  // 获取 render 方法
  // 判断是否有 render 方法，如果没有 render 方法，但是有 template，则使用 compileToFunctions 将 template 转化为 render 方法
  if (!options.render) {
    let template = options.template // 获取 template
    if (template) {
      if (typeof template === 'string') {
        // 如果 template 是字符串并且以 # 开头，则获取此 id 下的元素字符串作为 template
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        // 如果 template 本来就是个元素，则获取其 innerHTML 作为 template
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // 如果没有 render 方法并且也没有 template，获取 le 的 outerHTML 作为 template
      template = getOuterHTML(el) // 获取 outerHTML 作为 template
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      // 使用 compileToFunctions 将 template 转化为 render 和 staticRenderFns 方法
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // 获取 render 方法后，调用原始的 mount 方法
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) { // 存在 outerHTML
    return el.outerHTML
  } else {
    const container = document.createElement('div') // 如果没有 outerHTML，创建一个 div
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
