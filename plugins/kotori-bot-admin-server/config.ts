export default {
	port: 8000,
	web: {
		user: 'himeno',
		pwd: '2333',
		expireTime: 300,
	},
	bot: {
		cmd: '/login',
		descr: '获取Kotori-Amdin后台一键登录地址',
		info:
			'以下是您的BOT后台管理的一键登录地址:' +
			'\nhttp://127.0.0.1:%port%%path%' +
			'\n%face_address%:%port%%path%' +
			'\n登录地址将在[%expire_time%秒]后过期，请勿泄露给他人',
		allowGroup: true,
		faceaAddress: 'http://c.huoshen80.cn',
	},
};
