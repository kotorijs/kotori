import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'

type HttpMethod<T = unknown> = (
  url: string,
  params?: { [key: string]: string | number | boolean },
  config?: AxiosRequestConfig<unknown>
) => Promise<T>

type Method = 'get' | 'delete' | 'head' | 'options'

export class Http {
  private instance: AxiosInstance

  private config: AxiosRequestConfig

  private method = async (
    url: string,
    params?: Parameters<HttpMethod>[1],
    config?: AxiosRequestConfig,
    method: Method = 'get'
  ) => (await this.instance[method](url, Object.assign(this.config, config || {}, { params }))).data

  public constructor(config?: AxiosRequestConfig) {
    this.config = config || {}
    this.instance = axios.create(this.config)
    this.request = this.instance.interceptors.request.use.bind(this.instance.interceptors.request)
    this.response = this.instance.interceptors.response.use.bind(this.instance.interceptors.response)
  }

  public extend(config: AxiosRequestConfig) {
    const NewHttp = new Http(Object.assign(this.config, config))
    return NewHttp
  }

  public readonly get: HttpMethod = (url, params, config) => this.method(url, params, config, 'get')

  public readonly post: HttpMethod = async (url, params, config) =>
    (await axios.post(url, params, Object.assign(this.config, config))).data

  public readonly patch: HttpMethod = async (url, params, config) =>
    (await axios.patch(url, params, Object.assign(this.config, config))).data

  public readonly put: HttpMethod = async (url, params, config) =>
    (await axios.put(url, params, Object.assign(this.config, config))).data

  public readonly delete: HttpMethod = (url, params, config) => this.method(url, params, config, 'delete')

  public readonly head: HttpMethod = (url, params, config) => this.method(url, params, config, 'head')

  public readonly options: HttpMethod = (url, params, config) => this.method(url, params, config, 'options')

  public ws(address: string, protocols?: string | string[] | undefined) {
    return new WebSocket(`${this.config.baseURL ?? ''}${address}`, protocols)
  }

  public request: (typeof axios)['interceptors']['request']['use']

  public response: (typeof axios)['interceptors']['response']['use']
}

export default Http
