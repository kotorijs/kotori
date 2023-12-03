class Hand {
	public static start(hand: Hand) {
		const hands: Hand[] = ['石头', '剪刀', '布'];
		const computerHand = hands[Math.floor(Math.random() * 3)];

		let result;
		if (hand === computerHand) {
			result = [0, computerHand];
		} else if (
			(hand === '石头' && computerHand === '剪刀') ||
			(hand === '剪刀' && computerHand === '布') ||
			(hand === '布' && computerHand === '石头')
		) {
			result = [1, computerHand];
		} else {
			result = [2, computerHand];
		}

		return result;
	}
}

export default Hand;
