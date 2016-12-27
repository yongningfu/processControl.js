/***
* 异步控制包
*  
* 如何实现 next 
* 需求: 用户可以定义一系列的任务，这一系列的任务可以异步或者同步并且依次执行
*       用户可以利用next控制是否执行还需下一个任务 next(true) next(false)
*/


function asyncControl() {

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



var async = new asyncControl()

async.task("task1", function(next, firstData) {

	setTimeout(function() {
		console.log('task1')
		console.log(firstData.data)
		next(true)
	}, 1000)
})

async.task("task2", function(next) {

	setTimeout(function() {
		console.log('task2')
		next(true)
	}, 1000)
})

async.task("task3", function(next) {

	for (var i = 0; i < 1000000; i++) {
		var j = j * 2
	}
	console.log('task3')
	next(true, {"data": "task3' data"})
})


async.task("task4", function(next, receiveDataFromLastTask) {

	for (var i = 0; i < 1000000; i++) {
		var j = j * 2
	}
	console.log('task4')
	console.log('the data from task3', receiveDataFromLastTask.data)
	next(true)
	// next(true)
})


async.task("task5", function(next) {
	setTimeout(function() {
		console.log('task5')
		next(true)
	}, 500)
	// next(false)
})


async.task("task6", function(next) {

	for (var i = 0; i < 1000000; i++) {
		var j = j * 2
	}
	console.log('task6')
	next(true)
})


async.run({"data": "these are first task's data"})

setTimeout(async.run, 2000)

setTimeout(async.run,  5000, {data: 'init data'})

























