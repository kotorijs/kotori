/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-18 16:15:05
 */
import { spawn, ChildProcess } from 'child_process';
import { ProcessCallback, ProcessStatus } from '../type';

export class ProcessController {
	private program: string;

	private child?: ChildProcess;

	private path?: string;

	private params?: string[];

	private stdout?: ProcessCallback;

	private stderr: ProcessCallback;

	public status: ProcessStatus = ProcessStatus.UNKNOWN;

	public constructor(
		program: string,
		path?: string,
		params?: string[],
		stdout?: ProcessCallback,
		stderr?: ProcessCallback,
	) {
		this.program = program;
		this.path = path;
		this.params = params;
		this.stdout = stdout;
		this.stderr =
			stderr ||
			(data => {
				console.error(data.toString('utf-8'));
			});
	}

	public start = () => {
		this.status = ProcessStatus.START;
		this.child = spawn(this.program, this.params, {
			cwd: this.path,
		});
		this.child.stderr!.on('data', data => this.stderr(data));
		if (typeof this.stdout !== 'function') return;
		this.child.stdout!.on('data', data => this.stdout!(data));
	};

	public stop = () => {
		this.status = ProcessStatus.STOP;
		if (!(this.child instanceof ChildProcess)) return;
		this.child.kill();
	};

	public restart = () => {
		this.stop();
		this.start();
	};
}

export default ProcessController;
