import puppeteer from 'puppeteer';
import { EventDataType, getDate, getRandomInt } from '@/tools';
import config from '../config';
import { queryExp } from '..';

export class Profile {
	private event: EventDataType;

	private exp: number;

	public constructor(event: EventDataType, exp: number) {
		this.event = event;
		this.exp = exp;
	}

	private initData = () => {
		const { role, title, nickname } = this.event.sender;
		let { sex } = this.event.sender;
		if (sex === 'unknown') sex = getRandomInt(1) ? 'male' : 'female';
		const sexColor = sex === 'male' ? 'DeepSkyBlue' : 'Pink';
		const titleRaw = [];
		switch (role) {
			case 'owner':
				titleRaw.push('群主', 'Gold');
				break;
			case 'admin':
				titleRaw.push('管理员', 'MediumAquamarine');
				break;
			default:
				titleRaw.push('成员', 'LightSkyBlue');
				break;
		}
		if (title) {
			titleRaw[0] = title;
			if (role === 'member') titleRaw[1] = 'BlueViolet';
		}

		const { 0: level, 1: totalExp, 2: avg } = Profile.getLevel(this.exp);
		const progress = Profile.renderProgress(level >= config.maxLevel ? 100 : avg);
		return { titleRaw, nickname, sexColor, level, totalExp: level >= config.maxLevel ? '~' : totalExp, progress };
	};

	public static getLevel = (exp: number) => {
		if (exp < 0) return [-1, 0, 0];
		let totalExp = config.baseExp;
		let totalExpLast = 0;
		let level = 1;
		while (exp >= totalExp && level < config.maxLevel) {
			level += 1;
			totalExpLast = totalExp;
			totalExp = level * config.baseExp + totalExp;
		}
		const alreadyExp = exp - totalExpLast;
		const needExp = level * config.baseExp;
		const avg = parseInt(((alreadyExp / needExp) * 100).toFixed(), 10);
		return [level, totalExp, avg];
	};

	private static renderProgress = (num: number) => {
		let baseNum = 10;
		const list = [];
		while (num >= baseNum) {
			list.push('🌑');
			baseNum += 10;
		}
		const rest = num - list.length * 10;
		if (rest > 0) {
			if (rest < 5) {
				list.push('🌔');
			} else if (rest === 5) {
				list.push('🌓');
			} else if (rest < 10) {
				list.push('🌒');
			}
		}
		while (list.length < 10) {
			list.push('🌕');
		}
		console.log(list, list.length);
		return list.join('');
	};

	public render = async () => {
		const browser = await puppeteer.launch({ headless: 'new' });
		const page = await browser.newPage();

		const response = await fetch(`https://q.qlogo.cn/headimg_dl?spec=640&dst_uin=${this.event.user_id}`);
		const arrayBuffer = await response.arrayBuffer();
		const base64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
		const { msg, sign } = queryExp(this.event.group_id!, this.event.user_id)[0];

		return page.evaluate(
			(data, eventData, exp, base64, msg, isSign) =>
				new Promise(resolve => {
					const width = 1000;
					const height = 500;
					const { titleRaw, nickname, sexColor, level, totalExp, progress } = data;
					const canvas = document.createElement('canvas');
					canvas.width = 1000;
					canvas.height = 500;

					const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

					const img = new Image();
					img.src = base64;

					img.onload = () => {
						// Draw white background and image
						ctx.fillStyle = 'white';
						ctx.fillRect(0, 0, width, height);
						ctx.drawImage(img, 0, 0, height, height);

						// Draw image edge gradient
						const imgEdgeGrad = ctx.createLinearGradient(410, 0, 520, 0);
						imgEdgeGrad.addColorStop(0, 'rgba(255,255,255,0)');
						imgEdgeGrad.addColorStop(1, 'white');
						ctx.fillStyle = imgEdgeGrad;
						ctx.fillRect(400, 0, width, height);

						// Draw border
						ctx.lineWidth = 2;
						ctx.strokeStyle = sexColor;
						ctx.strokeRect(0, 0, width, height);

						// Render text
						ctx.font = 'bold 30px Arial';
						ctx.fillStyle = sexColor;
						ctx.fillText(`群: ${eventData.group_id}`, 550, 120);

						ctx.font = 'bold 23px Arial';
						ctx.fillStyle = 'grey';
						ctx.fillText(nickname, 550, 150);

						ctx.font = 'bold 21px Calibri';
						ctx.fillStyle = 'grey';
						ctx.fillText('🔎头衔: ', 540, 300);
						ctx.fillText('🔔发言: ', 740, 300);
						ctx.fillText('⏰签到: ', 540, 350);
						ctx.fillText('⚖️等级: ', 740, 350);
						ctx.fillText('🔋经验: ', 540, 400);

						ctx.font = '20px Calibri';
						ctx.fillStyle = titleRaw[1];
						ctx.fillText(titleRaw[0], 620, 300);
						ctx.fillStyle = isSign ? 'green' : 'red';
						ctx.fillText(isSign ? '已签到' : '未签到', 620, 350);
						ctx.fillStyle = 'grey';
						ctx.fillText(`${msg}次`, 820, 300);
						ctx.fillText(`LV.${level}`, 820, 350);

						ctx.font = '18px Calibri';
						ctx.fillText(`(${exp}/${totalExp})`, 865, 350);
						ctx.fillText(progress, 620, 400);

						ctx.font = '1000 70px Arial';
						ctx.fillStyle = sexColor;
						ctx.fillText(sexColor === 'male' ? '♂' : '♀', 950, 50);

						ctx.font = '14px Arial';
						ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
						ctx.fillText('ByHotaru', 930, 485);

						// Return base64 image data
						resolve(canvas.toDataURL());
					};
				}) as Promise<string>,
			this.initData(),
			this.event,
			this.exp,
			base64,
			msg,
			sign.includes(getDate()),
		);
	};
}

export default Profile;
