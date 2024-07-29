import { Context, Tsu } from 'kotori-bot'

export const lang = [__dirname, '../locales']

const motdSchema = Tsu.Object({
  data: Tsu.Union(
    Tsu.Object({
      status: Tsu.Literal('offline')
    }),
    Tsu.Object({
      status: Tsu.Literal('online'),
      ip: Tsu.String(),
      real: Tsu.String(),
      location: Tsu.String(),
      port: Tsu.String(),
      motd: Tsu.String(),
      version: Tsu.String(),
      agreement: Tsu.Number(),
      online: Tsu.Number(),
      max: Tsu.Number(),
      ping: Tsu.Number(),
      icon: Tsu.Unknown()
    })
  )
})

const motdbeSchema = Tsu.Object({
  data: Tsu.Union(
    Tsu.Object({
      status: Tsu.Literal('offline')
    }),
    Tsu.Object({
      status: Tsu.Literal('online'),
      ip: Tsu.String(),
      real: Tsu.String(),
      location: Tsu.String(),
      port: Tsu.Number(),
      motd: Tsu.String(),
      version: Tsu.String(),
      agreement: Tsu.Number(),
      online: Tsu.Number(),
      max: Tsu.Number(),
      delay: Tsu.Number(),
      gamemode: Tsu.String()
    })
  )
})

const mcskinSchema = Tsu.Object({
  data: Tsu.Union(
    Tsu.Null().optional(),
    Tsu.Object({
      skin: Tsu.String(),
      cape: Tsu.String().optional(),
      avatar: Tsu.String()
    })
  )
})

const mcvSchema1 = Tsu.Object({
  latest: Tsu.Object({
    release: Tsu.String(),
    snapshot: Tsu.String()
  }),
  versions: Tsu.Array(
    Tsu.Object({
      id: Tsu.String(),
      releaseTime: Tsu.String()
    })
  )
})

const mcvSchema2 = Tsu.Array(
  Tsu.Object({
    name: Tsu.String(),
    releaseDate: Tsu.String().optional()
  })
)

// TODO: update

export function main(ctx: Context) {
  ctx.command('motd <ip> [port:number=25565] - minecraft.descr.motd').action(async (data, session) => {
    const res = motdSchema.parse(
      await ctx.http.get('https://api.hotaru.icu/api/motd', { ip: data.args[0], port: data.args[1] })
    )
    if (res.data.status !== 'online') return ['minecraft.msg.motd.fail', [data.args[0], data.args[1]]]
    const { ip, port, location, motd, agreement, version, online, max, ping } = res.data
    const icon = typeof res.data.icon === 'string' ? session.el.image(`base64://${res.data.icon.substring(22)}`) : ''
    return ['minecraft.msg.motd', [ip, port, location, motd, agreement, version, online, max, ping, icon]]
  })

  ctx.command('motdbe <ip> [port:number=19132] - minecraft.descr.motdbe').action(async (data) => {
    const res = motdbeSchema.parse(
      await ctx.http.get('https://api.hotaru.icu/api/motdpe', { ip: data.args[0], port: data.args[1] })
    )
    if (res.data.status !== 'online') return ['minecraft.msg.motdbe.fail', [data.args[0], data.args[1]]]
    const { ip, port, location, motd, gamemode, agreement, version, online, max, delay } = res.data
    return ['minecraft.msg.motdbe', [ip, port, location, motd, gamemode, agreement, version, online, max, delay]]
  })

  ctx
    .command('mcskin <name>')
    .action(async (data, session) => {
      const res = mcskinSchema.parse(await ctx.http.get('https://api.hotaru.icu/api/mcskin', { name: data.args[0] }))
      if (!res.data) return ['minecraft.msg.mcskin.fail', [data.args[0]]]
      return [
        'minecraft.msg.mcskin',
        [
          data.args[0],
          session.el.image(res.data.skin),
          res.data.cape ? session.el.image(res.data.cape) : '',
          res.data.avatar ? session.el.image(`base64://${res.data.avatar.substring(22)}`) : ''
        ]
      ]
    })
    .help('minecraft.descr.mcskin')

  ctx
    .command('mcv')
    .action(async (_, session) => {
      const res = mcvSchema1.parse(await ctx.http.get('https://piston-meta.mojang.com/mc/game/version_manifest.json'))
      const res2 = mcvSchema2.parse(await ctx.http.get('https://bugs.mojang.com/rest/api/2/project/10200/versions'))
      const { release, snapshot } = res.latest
      const releaseDate = session.i18n.date(new Date(res.versions.find((el) => el.id === release)!.releaseTime))
      const snapshotDate = session.i18n.date(new Date(res.versions.find((el) => el.id === snapshot)!.releaseTime))
      const { name: mcbe, releaseDate: mcbeDate } = res2.find((el) => !!el.releaseDate)!
      return [
        'minecraft.msg.mcv',
        [release, releaseDate, snapshot, snapshotDate, mcbe, session.i18n.date(new Date(mcbeDate!))]
      ]
    })
    .help('minecraft.descr.mcv')
}
