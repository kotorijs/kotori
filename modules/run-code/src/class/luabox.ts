import { createEnv } from 'lua-in-js'
import JsBox from './jsBox'

class LuaBox extends JsBox {
  public run() {
    const backupLog = console.log
    console.log = (...args: unknown[]) => this.method.console.log(...args)
    createEnv().parse(this.code).exec()
    console.log = backupLog
    return this.box.result
  }
}

export default LuaBox
