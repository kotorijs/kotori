interface ServiceImpl {
	readonly config: object;
	handle(...data: unknown[]): void;
	start(): void;
	stop(): void;
}

export abstract class Service implements ServiceImpl {
	public abstract readonly config: object;

	public abstract handle(...data: unknown[]): void;

	public abstract start(): void;

	public abstract stop(): void;
}

export default Service;
