export const getSex = (val: string, locale): string => {
	switch (val) {
		case 'male':
			return locale('goodnight.msg.morning.male');
		case 'female':
			return locale('goodnight.msg.morning.female');
		default:
			return getSex(getRandomInt(1) === 1 ? 'male' : 'femal');
	}
};

export const formatTime = (timecal: number, locale) => {
	let timeDiff = timecal;
	const hours = Math.floor(timeDiff / 3600000);
	timeDiff %= 3600000;
	const minutes = Math.floor(timeDiff / 60000);
	timeDiff %= 60000;
	const seconds = Math.floor(timeDiff / 1000);
	return (
		hours +
		locale('goodnight.msg.night.hours') +
		minutes +
		locale('goodnight.msg.night.minutes') +
		seconds +
		locale('goodnight.msg.night.seconds')
	);
};
