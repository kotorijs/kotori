import axios from 'axios';
import WebSocket from 'ws';

(async () => {
	const verify = (
		await axios.post('https://bots.qq.com/app/getAppAccessToken', {
			appId: '102073009',
			clientSecret: 'HTSDj140jDSTFn6A',
		})
	).data;
	// const address = (await axios.get(''))
	console.log(verify);
	let a = 0;
	const ws = new WebSocket('wss://api.sgroup.qq.com/websocket');
	ws.on('close', data => console.log('closed: ', data));
	ws.on('error', data => console.log('error: ', data));
	ws.on('message', async data => {
		const json = JSON.parse(data.toString());
		console.log('message: ', json);
		if (json.op === 10) {
			ws.send(
				JSON.stringify({
					op: 2,
					d: {
						token: `QQBot ${verify.access_token}`,
						intents: 1241513984,
						shard: [0, 1],
					},
				}),
			);
			ws.send(JSON.stringify({ op: 1, d: null }));
		} else if (
			json.t === 'GROUP_AT_MESSAGE_CREATE' &&
			json.d &&
			typeof json.d.content === 'string' &&
			(json.d.content as string).includes('t')
		) {
			a += 1;
			console.log(
				(
					await axios.post(
						`https://api.sgroup.qq.com/v2/groups/${json.d.group_id}/messages`,
						{
							content: json.d.content,
							msg_type: 0,
							msg_id: json.d.id,
							msg_seq: a,
						},
						{
							headers: {
								Authorization: `QQBot ${verify.access_token}`,
								'X-Union-Appid': '102073009',
							},
							validateStatus: () => true,
						},
					)
				).data,
			);
		}
	});
	ws.on('open', () => {
		console.log('open');
	});
	process.stdin.on('data', data => {
		let message = data.toString();
		if (message === '\n' || message === '\r\n') return;
		message = message.replace('\r\n', '').replace('\n', '');
		try {
			const json = JSON.parse(message);
			console.log('input: ', json);
			// ws.send(json);
		} catch (e) {
			console.log('JSON: ', e);
		}
	});
})();
