/* @flow */

import config from '../config'
import { warn } from './debug'
import { inBrowser, inWeex } from './env'
import { isPromise } from 'shared/util'

export function handleError (err: Error, vm: any, info: string) {
  if (vm) { // 如果存在 vm
    let cur = vm
    while ((cur = cur.$parent)) { // 往上上溯
      const hooks = cur.$options.errorCaptured
      if (hooks) { // 若上溯到e rrorCaptured 方法
        for (let i = 0; i < hooks.length; i++) { // 依次执行上溯到的 errorCaptured 方法
          try {
            const capture = hooks[i].call(cur, err, vm, info) === false // 判断是否捕获此错误
            if (capture) return // 若捕获错误，则什么都不用另外做
          } catch (e) {
            globalHandleError(e, cur, 'errorCaptured hook')
          }
        }
      }
    }
  }
  globalHandleError(err, vm, info) // 错误上溯到全局处理
}

export function invokeWithErrorHandling (
  handler: Function, // 具体需要执行的方法
  context: any, // 执行上下文
  args: null | any[], // 额外参数
  vm: any, // vm
  info: string
) {
  let res
  try {
    res = args ? handler.apply(context, args) : handler.call(context)
    if (isPromise(res)) {
      res.catch(e => handleError(e, vm, info + ` (Promise/async)`))
    }
  } catch (e) {
    handleError(e, vm, info)
  }
  return res
}

function globalHandleError (err, vm, info) {
  if (config.errorHandler) { // 如果有配置全局错误处理器
    try {
      return config.errorHandler.call(null, err, vm, info) // 执行全局错误处理函数
    } catch (e) {
      logError(e, null, 'config.errorHandler')
    }
  }
  logError(err, vm, info)
}

function logError (err, vm, info) {
  if (process.env.NODE_ENV !== 'production') {
    warn(`Error in ${info}: "${err.toString()}"`, vm)
  }
  /* istanbul ignore else */
  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err)
  } else {
    throw err
  }
}
