import { type Context, Messages, Tsu } from 'kotori-bot'

export const lang = [__dirname, '../locales']

const motdResSchema = Tsu.Object({
  online: Tsu.Boolean(),
  version: Tsu.String(),
  motd: Tsu.String(),
  players_online: Tsu.Number(),
  players_max: Tsu.Number()
})

const mcskinResSchema = Tsu.Object({
  skin: Tsu.String(),
  cape: Tsu.Union(Tsu.String(), Tsu.Null()).optional()
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

export function main(ctx: Context) {
  ctx.command('motd <ip> [port:number=25565] - minecraft.descr.motd').action(async (data, session) => {
    const host = data.args[0]
    const port = data.args[1] ?? 25565
    const url =
      port === 25565
        ? `https://i.arimuraromi.com/api/utils/motd/${encodeURIComponent(host)}`
        : `https://i.arimuraromi.com/api/utils/motd/${encodeURIComponent(host)}/${port}`

    try {
      const raw = await ctx.http.get(url)
      const res = motdResSchema.parse(raw)
      if (!res.online) return session.format('minecraft.msg.motd.fail', [host, String(port)])
      const { motd, version, players_online, players_max } = res
      return session.format('minecraft.msg.motd', [host, String(port), '-', motd, '-', version, players_online, players_max, '-', ''])
    } catch {
      return session.format('minecraft.msg.motd.fail', [host, String(port)])
    }
  })

  ctx.command('motdbe <ip> [port:number=19132] - minecraft.descr.motdbe').action(async (data, session) => {
    const host = data.args[0]
    const port = data.args[1] ?? 19132
    const url =
      port === 19132
        ? `https://i.arimuraromi.com/api/utils/motdbe/${encodeURIComponent(host)}`
        : `https://i.arimuraromi.com/api/utils/motdbe/${encodeURIComponent(host)}/${port}`

    try {
      const raw = await ctx.http.get(url)
      const res = motdResSchema.parse(raw)
      if (!res.online) return session.format('minecraft.msg.motdbe.fail', [host, String(port)])
      const { motd, version, players_online, players_max } = res
      const params = [host, String(port), '-', motd, '-', '-', version, players_online, players_max, '-']
      return session.format('minecraft.msg.motdbe', params)
    } catch {
      return session.format('minecraft.msg.motdbe.fail', [host, String(port)])
    }
  })

  ctx.command('mcskin <name> - minecraft.descr.mcskin').action(async (data, session) => {
    const name = data.args[0]
    const url = `https://i.arimuraromi.com/api/utils/mcskin/${encodeURIComponent(name)}`
    try {
      const raw = await ctx.http.get(url)
      const res = mcskinResSchema.parse(raw)
      if (!res.skin) return session.format('minecraft.msg.mcskin.fail', [name])
      return session.format('minecraft.msg.mcskin', [name, Messages.image(res.skin), res.cape ? Messages.image(res.cape) : '', ''])
    } catch {
      return session.format('minecraft.msg.mcskin.fail', [name])
    }
  })

  ctx.command('mcv - minecraft.descr.mcv').action(async (_, session) => {
    const res = mcvSchema1.parse(await ctx.http.get('https://piston-meta.mojang.com/mc/game/version_manifest.json'))
    const { release, snapshot } = res.latest
    const releaseDate = session.i18n.date(new Date(res.versions.find((el) => el.id === release)?.releaseTime ?? 0))
    const snapshotDate = session.i18n.date(new Date(res.versions.find((el) => el.id === snapshot)?.releaseTime ?? 0))
    const params = [release, releaseDate, snapshot, snapshotDate, '', '']
    return session.format('minecraft.msg.mcv', params)
  })
}
