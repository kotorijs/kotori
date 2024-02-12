class Dir {
	public dir(obj: object | null) {
		return this.formatObject(obj);
	}

	private formatObject(obj: object | null) {
		let str = '{\n';

		if (obj) {
			Object.keys(obj).forEach(key => {
				str += `  ${key}: ${this.formatValue(obj[key as keyof object])}`;
				str += '\n';
			});
		}
		str += '}';
		return str;
	}

	private formatValue(val: unknown) {
		if (val === null) {
			return 'null';
		}
		if (typeof val === 'object') {
			return this.formatObject(val);
		}
		if (typeof val === 'string') {
			return `"${val}"`;
		}
		return val;
	}
}

export default Dir;
