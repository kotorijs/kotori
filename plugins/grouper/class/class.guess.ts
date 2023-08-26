import { obj } from '@/tools';
import config from '../config';

class Guess {
	public static guessData: obj<[number, number]> = {};

	public static start = (qq: number) => {
		const min = Math.floor(Math.random() * config.guess.max) + config.guess.min;
		const max = min + config.guess.range;
		const number = Math.floor(Math.random() * (max - min) + min);

		this.guessData[qq] = [number, 0];

		return {
			min,
			max,
		};
	};

	public static guess = (qq: number, num: number) => {
		if (!this.guessData[qq]) return null;

		this.guessData[qq][1] += 1;

		if (num === this.guessData[qq][0]) {
			const num = this.guessData[qq][1];
			delete this.guessData[qq];
			return num;
		}
		return false;
	};

	public static giveup = (qq: number) => {
		delete this.guessData[qq];
	};
}

export default Guess;
