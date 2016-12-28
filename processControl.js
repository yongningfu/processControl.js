/***
* 异步控制包
*  
* 如何实现 next 
* 需求: 用户可以定义一系列的任务，这一系列的任务可以异步或者同步并且依次执行
*       用户可以利用next控制是否执行还需下一个任务 next(true) next(false)
*/


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
* 			讲真 js并发同步没必要  当然你把同步封装成一个含有回调的函数也是可以传递的
*           
* 具体如何和 ProcessControl 可以看例子
*/
ProcessControl.prototype.concurrentTasks = function () {
	

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




//------------------------test----------------------

function concurrentTask1(callback) {
	setTimeout(function() {callback(null, {"aa":11})}, 2000)
}


//整和其他异步方访问库的例子
function concurrentTask2(callback) {

	var fs = require('fs')

	// fs.readFile('test.txt', "utf8", callback)
	fs.readFile('test.txt', "utf8", function(err, data) {
		if (err) callback(err)
		else callback(null, data.toString())
	})
}

function concurrentTask3(callback) {
	setTimeout(function() {callback(null, {"aa":33})}, 100)
}


//--------使用demo

//启动一个流程控制
//注意: next必须放在函数结束末尾

var processControl = new ProcessControl()

processControl.task("task1", function(next, firstData) {

	setTimeout(function() {
		console.log('task1')
		console.log(firstData.data)
		next(true)
	}, 1000)
})

processControl.task("task2", function(next) {

	setTimeout(function() {
		console.log('task2')
		next(true)
	}, 1000)
})


//并入并发的用法
// processControl.concurrentTasks 只是我们提供的方便开发者容易调用的并发api
// 在流程控制中 需要将其用task 接入

processControl.task('concurrentTasks', function(next) {

	processControl.concurrentTasks(concurrentTask1, concurrentTask2, concurrentTask3, function(err, data) {
			if (err) {
				throw 'concurrentTasks error'
				next(false)
			} else {
				console.log(data)
				next(true, data)
			}
	})
})

processControl.task("task3", function(next, receiveDataFromLastTask) {

	console.log(receiveDataFromLastTask)

	for (var i = 0; i < 1000000; i++) {
		var j = j * 2
	}
	console.log('task3')
	next(true, {"data": "task3' data"})
})


processControl.task("task4", function(next, receiveDataFromLastTask) {

	for (var i = 0; i < 1000000; i++) {
		var j = j * 2
	}
	console.log('task4')
	console.log('the data from task3', receiveDataFromLastTask.data)
	next(true)
	// next(true)
})


processControl.task('concurrentTasks2', function(next) {

	processControl.concurrentTasks(concurrentTask1, concurrentTask2, concurrentTask3, function(err, data) {
			if (err) {
				throw 'concurrentTasks error'
				next(false)
			} else {
				console.log(data)
				next(true, data)
			}
	})
})


processControl.task("task5", function(next) {
	setTimeout(function() {
		console.log('task5')
		next(true)
	}, 500)
	// next(false)
})


processControl.task("task6", function(next) {

	for (var i = 0; i < 1000000; i++) {
		var j = j * 2
	}
	console.log('task6')
	next(true)
})



processControl.run({"data": "these are first task's data"})

// setTimeout(processControl.run, 2000)

// setTimeout(processControl.run,  8000, {data: 'init data'})


// 循环中使用 demo

// for (var i = 0; i < 3; i++) {

// 	let processControlCir = new ProcessControl()
// 	processControlCir.task("task5", function(next) {
// 		setTimeout(function() {
// 			console.log('task5')
// 			next(true)
// 		}, 2000)
// 		// next(false)
// 	})


// 	processControlCir.task("task6", function(next) {

// 	for (var i = 0; i < 1000000; i++) {
// 			var j = j * 2
// 		}
// 		console.log('task6')
// 		next(true)
// 	})
// 	processControlCir.run()
// }



























