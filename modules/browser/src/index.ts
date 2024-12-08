import { type Context, Service, KotoriError } from 'kotori-bot'
import puppeteer from 'puppeteer'
import type { Browser as PuppeteerBrowser } from 'puppeteer'

type BrowserImpl = Context['browser']

export default class Browser extends Service implements BrowserImpl {
  public instance?: PuppeteerBrowser

  public constructor(ctx: Context) {
    super(ctx, {}, 'browser')
  }

  public async start() {
    this.ctx.logger.debug('Starting browser service')
    if (this.instance) throw new KotoriError('Browser instance is already running')
    this.instance = await puppeteer.launch({
      headless: true
    })
  }

  public async stop() {
    if (this.instance) this.instance.close()
    this.instance = undefined
  }

  public page() {
    if (!this.instance) throw new KotoriError('Browser instance is not running')
    return this.instance.newPage()
  }
}
