/***
* 异步控制包
*  
* 如何实现 next 
* 需求: 用户可以定义一系列的任务，这一系列的任务可以异步并且依次执行
*       用户可以利用next控制是否执行还需下一个任务 next(true) next(false)
*/


function asyncControl() {

	this.state = 'idle'  // idle or running
	this.currentPosition = -1 // record the current task position -1 meana idle
	this.tasks = []           // 每个元素为一个长度为2的数组 0 为 task name 1 为 执行函数

	this.task = function(taskName, userTaskOperator) {
		this.tasks.push([taskName, userTaskOperator]) 
	}

	this.next = (isAllowedToNext) => {
		if (isAllowedToNext) {
			this.currentPosition++
			this.doNext()
		} else {
			this.state = 'idle'
			this.currentPosition = -1	
		}
	}

	this.doNext = () => {
		
		if (this.currentPosition >= this.tasks.length || this.tasks.length === 0) {

			this.state = 'idle'
			this.currentPosition = -1
			return
		}

		if (this.state === 'idle') {
			this.currentPosition = 0 
			this.state = 'running'
		}

		this.tasks[this.currentPosition][1](this.next)
	}


	this.run = () => {

		if (this.state === 'running') {
			console.log('sorry there are some tasks are running')
			return
		}

		this.doNext()
	}
}



var async = new asyncControl()

async.task("task1", function(next) {

	setTimeout(function() {
		console.log('task1')
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
	next(true)
})


async.task("task4", function(next) {

	for (var i = 0; i < 1000000; i++) {
		var j = j * 2
	}
	console.log('task4')
	next(true)
})


async.task("task5", function(next) {
	setTimeout(function() {
		console.log('task5')
		next(true)
	}, 500)
})


async.task("task6", function(next) {

	for (var i = 0; i < 1000000; i++) {
		var j = j * 2
	}
	console.log('task6')
	next(true)
})


async.run()

setTimeout(async.run, 2000)

setTimeout(async.run, 5000)

























