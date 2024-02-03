import axios, { AxiosRequestConfig } from 'axios';

type HttpMethod<T = unknown> = (
  url: string,
  params?: { [key: string]: string | number | boolean },
  config?: AxiosRequestConfig<any>
) => Promise<T>;

type Method = 'get' | 'delete' | 'head';

export class Http {
  private config: AxiosRequestConfig;

  private method = async (
    url: string,
    params?: Parameters<HttpMethod>[1],
    config?: Parameters<HttpMethod>[2],
    method: Method = 'get'
  ) => {
    const response = (await axios[method](url, Object.assign(this.config, config || {}, { params }))).data;
    return response;
  };

  constructor(config?: Parameters<HttpMethod>[2]) {
    this.config = config || {};
  }

  extend(config: Parameters<HttpMethod>[2]) {
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
