import axios, { AxiosRequestConfig } from 'axios';
import { FuncStringProcessStr, obj } from './types';

type HttpMethod<T = obj> = (
	url: string,
	params?: { [key: string]: FuncStringProcessStr },
	config?: AxiosRequestConfig<any>,
) => Promise<T>;

type Method = 'get' | 'post' | 'patch' | 'put' | 'delete' | 'head';

export class Http {
	private config: AxiosRequestConfig;

	private method = async (
		url: string,
		params?: { [key: string]: string | number },
		config = {},
		method: Method = 'get',
	) => {
		const response = (await axios[method](url, Object.assign(this.config, config, params))).data;
		return response;
	};

	public constructor(config?: AxiosRequestConfig<any>) {
		this.config = config || {};
	}

	public extend = (config: AxiosRequestConfig<any>) => {
		const NewHttp = new Http(Object.assign(this.config, config));
		return NewHttp;
	};

	public get: HttpMethod = (url, params, config) => this.method(url, params, config, 'get');

	public post: HttpMethod = async (url, params, config) =>
		(await axios.post(url, params, Object.assign(this.config, config))).data;

	/* here need update */
	public patch: HttpMethod = (url, params, config) => this.method(url, params, config, 'patch');

	public put: HttpMethod = (url, params, config) => this.method(url, params, config, 'put');

	public delete: HttpMethod = (url, params, config) => this.method(url, params, config, 'delete');

	public head: HttpMethod = (url, params, config) => this.method(url, params, config, 'head');
}

export default Http;
