import axios, { AxiosRequestConfig } from 'axios';
import { FuncStringProcessStr } from '../types';

type HttpMethod<T = unknown> = (
  url: string,
  params?: { [key: string]: FuncStringProcessStr },
  config?: AxiosRequestConfig<any>
) => Promise<T>;

type Method = 'get' | 'delete' | 'head';

export class Http {
  private config: AxiosRequestConfig;

  private method = async (
    url: string,
    params?: { [key: string]: string | number },
    config?: AxiosRequestConfig,
    method: Method = 'get'
  ) => {
    const response = (await axios[method](url, Object.assign(this.config, config || {}, { params }))).data;
    return response;
  };

  constructor(config?: AxiosRequestConfig<any>) {
    this.config = config || {};
  }

  extend(config: AxiosRequestConfig<any>) {
    const NewHttp = new Http(Object.assign(this.config, config));
    return NewHttp;
  }

  readonly get: HttpMethod = (url, params, config) => this.method(url, params, config, 'get');

  readonly post: HttpMethod = async (url, params, config) =>
    (await axios.post(url, params, Object.assign(this.config, config))).data;

  readonly patch: HttpMethod = async (url, params, config) =>
    (await axios.patch(url, params, Object.assign(this.config, config))).data;

  readonly put: HttpMethod = async (url, params, config) =>
    (await axios.put(url, params, Object.assign(this.config, config))).data;

  readonly delete: HttpMethod = (url, params, config) => this.method(url, params, config, 'delete');

  readonly head: HttpMethod = (url, params, config) => this.method(url, params, config, 'head');
}

export default Http;
