/* eslint no-console: 0 */
import { createEnv } from 'lua-in-js'
import JsBox from './jsBox'

class LuaBox extends JsBox {
  public async run() {
    const backupLog = console.log
    try {
      console.log = (...args: unknown[]) => this.method.console.log(...args)
      createEnv().parse(this.code).exec()
    } catch (error) {
      this.method.console.error(String(error))
    } finally {
      console.log = backupLog
    }
    return this.box.result
  }
}

export default LuaBox
