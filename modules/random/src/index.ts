import { plugins, type Session, KotoriPlugin, Tsu, random } from 'kotori-bot'
import { DiceRoll } from '@dice-roller/rpg-dice-roller'
import pkg from '../package.json'
import Mexp from 'math-expression-evaluator'

const plugin = plugins(pkg)

@plugin.import
export class ColorPlugin extends KotoriPlugin<Tsu.infer<(typeof ColorPlugin)['schema']>> {
  @plugin.lang
  public static lang = [__dirname, '../locales']

  @plugin.schema
  public static schema = Tsu.Object({
    coinLimit: Tsu.Number().positive().int().default(10000).describe('Coin flip limit'),
    coinFaceUpRate: Tsu.Number().positive().default(0.4997).describe('Coin face up rate'),
    coinFaceDownRate: Tsu.Number().positive().default(0.4997).describe('Coin face down rate')
  })

  @plugin.command({
    template: 'dice [...expression=3d6] - random.descr.dice',
    options: [['H', 'help:boolean random.option.dice.help']]
  })
  public async dice({ args, options: { help } }: { args: string[]; options: { help: boolean } }, session: Session) {
    if (help) return session.format('random.help.dice', [session.api.adapter.config.commandPrefix])
    const expr = args.join(' ').toLocaleLowerCase()
    if (!expr) return 'random.msg.dice.empty'
    let result: string
    try {
      result = new DiceRoll(expr).output
    } catch (e) {
      return session.format('random.msg.dice.error', [String(e)])
    }
    return session.format('random.msg.dice.success', [result])
  }

  @plugin.command({
    template: 'coin [amount:number] - random.descr.coin'
  })
  public flipCoins({ args: [count = 1] }: { args: [number?] }, session: Session) {
    if (count > this.config.coinLimit) {
      return session.format('random.msg.coin.invalid_out_of_range', [this.config.coinLimit])
    }
    if (count < 0) return 'random.msg.coin.invalid_amount'
    if (count === 0) return 'random.msg.coin.no_coin'

    let faceUp = 0
    let faceDown = 0
    let stand = 0
    for (let i = 0; i < count; i++) {
      const randNum = random.float()
      if (randNum < this.config.coinFaceUpRate) faceUp += 1
      else if (randNum < this.config.coinFaceUpRate + this.config.coinFaceDownRate) faceDown += 1
      else stand += 1
    }

    if (count === 1) {
      let msg = session.t`random.msg.coin.single_prompt`
      if (faceUp === 1) msg += session.t`random.msg.coin.single_head`
      else if (faceDown === 1) msg += session.t`random.msg.coin.single_tail`
      else msg += session.t`random.msg.coin.single_stand`
      return msg
    }
    if (faceDown + stand + faceUp === count) {
      let msg = session.format('random.msg.coin.all_prompt', [count])
      if (faceUp === count) {
        msg += session.t`random.msg.coin.all_head`
        return msg
      }
      if (faceDown === count) {
        msg += session.t`random.msg.coin.all_tail`
        return msg
      }
      if (stand === count) {
        msg += session.t`random.msg.coin.all_stand`
        return msg
      }
    }
    let msg = session.format('random.msg.coin.mix_prompt', [count])
    if (stand === 0) {
      msg += session.format('random.msg.coin.mix_head_and_tail', [faceUp, faceDown])
      return msg
    }
    if (faceUp !== 0) msg += session.format('random.msg.coin.mix_head', [faceUp])
    if (faceDown !== 0) msg += session.format('random.msg.coin.mix_tail', [faceDown])
    msg += session.format('random.msg.coin.mix_stand', [stand])
    return msg
  }

  @plugin.command({ template: 'int [min:number=0] [max:number=100] - random.descr.int' })
  public int({ args: [min, max] }: { args: [number?, number?] }) {
    return random.int(min, max).toString()
  }

  @plugin.command({ template: 'float [min:number=0] [max:number=1] - random.descr.float' })
  public float({ args: [min, max] }: { args: [number?, number?] }) {
    return random.float(min, max).toString()
  }

  @plugin.command({ template: 'choice [...items] - random.descr.choice' })
  public choice({ args }: { args: string[] }) {
    if (args.length === 0) return 'random.msg.choice.error'
    return random.choice(args)
  }

  @plugin.command({ template: 'shuttle [...items] - random.descr.shuttle' })
  public shuttle({ args }: { args: string[] }) {
    if (args.length === 0) return 'random.msg.shuttle.error'
    return random.shuffle(args).join(' ')
  }

  @plugin.command({ template: 'bool [offset:number=0.5] - random.descr.bool' })
  public bool({ args: [offset] }: { args: [number] }) {
    return String(random.bool(offset))
  }

  @plugin.command({ template: 'uuid - random.descr.uuid' })
  public uuid() {
    return random.uuid()
  }

  @plugin.command({
    template: 'calc [...expression] - random.descr.calc',
    options: [['H', 'help:boolean random.option.dice.help']],
    help: 'random.help.calc'
  })
  public calc({ args, options: { help } }: { args: string[]; options: { help: boolean } }, session: Session) {
    if (help) return 'random.help.calc'
    const expr = args.join(' ')
    if (!expr) return 'random.msg.calc.empty'

    let result: number
    try {
      result = new Mexp().eval(expr)
    } catch (e) {
      return session.format('random.msg.calc.error', [String(e)])
    }
    return session.format('random.msg.calc.success', [expr, result])
  }
}
