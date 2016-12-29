/***
* 异步控制包
*  
* 如何实现 next 
* 需求: 用户可以定义一系列的任务，这一系列的任务可以异步或者同步并且依次执行
*       用户可以利用next控制是否执行还需下一个任务 next(true) next(false)
*/


/* global module, define, setImmediate*/
;(function (root, factory) {
  // 'use strict'

  // CommonJS
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory()

  //AMD
  } else if (typeof define === 'function' && define.amd) {
    define([], factory)

  //<script>
  } else {
    root.ProcessControl = factory()
  }
}(typeof window === 'object' ? window : this, function () {


  function ProcessControl() {

    this.state = 'idle'  // idle or running
    this.willExecPosition = -1 // 记录将要执行的位置
    this.tasks = []           // 每个元素为一个长度为2的数组 0 为 task name 1 为 执行函数
    
    this.task = (taskName, userTaskOperator) => {
      this.tasks.push([taskName, userTaskOperator]) 
    }

    this.next = (isAllowedToNext, data) => {

      if (this.state === 'running') {
        if (isAllowedToNext) {
          this.willExecPosition++
          this.doNext(data)
        } else {
          this.state = 'idle'
          this.willExecPosition = -1  
        }
      } else {
        throw 'in the function, you can use next only once'
      }
    }

    this.doNext = (data) => {
      //end state to idle
      if (this.willExecPosition >= this.tasks.length) {

        this.state = 'idle'
        this.willExecPosition = -1
        return
      }
      this.tasks[this.willExecPosition][1](this.next, data)
    }

    this.run = (data) => {

      if (this.state === 'running') {
        console.log('sorry there are some tasks are running')
        return
      }

      if (this.willExecPosition >= this.tasks.length || this.tasks.length === 0) {
        return
      }

      this.state = 'running'
      this.willExecPosition = 0
      this.doNext(data)
    }
  }


  /** 
  * arguments 里面是一个个任务 不用传递回调
  * 这个api 是额外提供给用户进行并发处理的  
  * 参数为一个个异步任务 而且函数的形式必须为 funcion(callback(err, data))
  *
  * 不把这个直接整合在 类对象中的直接原因是 ProcessControl 单单只是提供流程控制的功能
  * 即 一个task 一个task的执行 这个提供这个 并发函数的意思是 我们实际确实是会使用到
  * 比如并发的查找数据库操作，故提供出来 方便开发者使用
  * 
  * tips:可以看到 这个函数里面并没有和this相关连 即它不参与对象状态的维护
  *
  * 可能问题: 为何不能传递同步函数
  *       讲真 js并发同步没必要  当然你把同步封装成一个含有回调的函数也是可以传递的
  *           
  * 具体如何和 ProcessControl 可以看例子
  */
  ProcessControl.prototype.UtilsConcurrentTasks = function () {

    var argumentsList = Array.prototype.slice.call(arguments)
    var concurrentTasksList = argumentsList.slice(0, arguments.length - 1)
    var callback = argumentsList[argumentsList.length - 1]

    var listData = []
    var count = 0
    concurrentTasksList.forEach(function(singleTask, index) {
      singleTask(function(err, data) {
        count++
        listData[index] = data

        if (err) {
          callback(err)
          return
        } else if (count == concurrentTasksList.length) {
          callback(null, listData)
        }
      })
    })
  }

  return ProcessControl
}))
