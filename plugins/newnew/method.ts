import config from './config';

export const getNewLength = () => {
	const { max, min } = config;
	const range = max - min + 1;
	const index = Math.floor(Math.random() * range);
	const result = min + index;
	return result;
};

export default getNewLength;
