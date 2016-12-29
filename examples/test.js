var ProcessControl = require('../processControl.js')

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

	processControl.UtilsConcurrentTasks(concurrentTask1, concurrentTask2, concurrentTask3, function(err, data) {
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

	processControl.UtilsConcurrentTasks(concurrentTask1, concurrentTask2, concurrentTask3, function(err, data) {
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

setTimeout(processControl.run, 2000)

setTimeout(processControl.run,  8000, {data: 'init data'})


// 循环中使用 demo

for (var i = 0; i < 3; i++) {

	let processControlCir = new ProcessControl()
	processControlCir.task("task5", function(next) {
		setTimeout(function() {
			console.log('task5')
			next(true)
		}, 2000)
		// next(false)
	})


	processControlCir.task("task6", function(next) {

	for (var i = 0; i < 1000000; i++) {
			var j = j * 2
		}
		console.log('task6')
		next(true)
	})
	processControlCir.run()
}
