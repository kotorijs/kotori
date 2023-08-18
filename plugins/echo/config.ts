export default {
	echo: {
		cmd: '/echo',
		descr: 'send a message on groups',
		args: ['content'],
		info: '%content%',
	},
	print: {
		cmd: '/print',
		descr: 'send a message on privates',
		args: ['message'],
		info: 'Result: %content%',
	},
};
