process.on('exit', () => {
	console.log('222');
});
process.stdin.on('close', () => {
	console.log('1');
});

process.stdin.on('data', data => {
	console.log(data.toString() === '\n' || data.toString() === '\r\n');
});
