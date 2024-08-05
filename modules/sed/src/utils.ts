import Kotori from 'kotori-bot'

export class Sed {
  public message: string

  public constructor(message: string) {
    this.message = message
  }

  public async qqToPhone() {
    // biome-ignore lint:
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/qqapi?qq=${this.message}`)) as Record<string, any>
    if (data.status !== 200) return null
    return {
      phone: data.phone,
      location: data.phonediqu
    }
  }

  public async qqToLol() {
    // biome-ignore lint:
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/qqlol?qq=${this.message}`)) as Record<string, any>
    if (data.status !== 200) return null
    return {
      id: data.name,
      area: data.daqu
    }
  }

  public async qqToOldPass() {
    // biome-ignore lint:
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/qqlm?qq=${this.message}`)) as Record<string, any>
    if (data.status !== 200) return null
    return data.qqlm
  }

  public async phoneToQq() {
    // biome-ignore lint:
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/qqphone?phone=${this.message}`)) as Record<string, any>
    if (data.status !== 200) return null
    return {
      qq: data.qq,
      location: data.phonediqu
    }
  }

  public async phoneToWeibo() {
    // biome-ignore lint:
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/wbphone?phone=${this.message}`)) as Record<string, any>
    if (data.status !== 200) return null
    return {
      id: data.id,
      location: data.phonediqu
    }
  }

  public async weiboToPhone() {
    // biome-ignore lint:
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/wbapi?id=${this.message}`)) as Record<string, any>
    if (data.status !== 200) return null
    return {
      phone: data.phone,
      location: data.phonediqu
    }
  }

  public async lolToQq() {
    // biome-ignore lint:
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/lolname?id=${this.message}`)) as Record<string, any>
    if (data.status !== 200) return null
    return {
      qq: data.qq,
      id: data.id,
      area: data.daqu
    }
  }

  public async query() {
    let phone: string | undefined
    let qq: string | undefined
    let weibo: string | undefined
    let qqOldPass: string | undefined
    let location: string | undefined
    let lol: string | undefined
    let area: string | undefined

    const arrTemp = await this.qqToPhone()
    const phoneTemp = arrTemp?.phone
    if (phoneTemp) {
      phone = phoneTemp
      qq = this.message
      location = arrTemp.location
      weibo = (await this.phoneToWeibo())?.id
      this.message = qq
      qqOldPass = await this.qqToOldPass()
      const arrTemp2 = await this.qqToLol()
      lol = arrTemp2?.id
      area = lol ? arrTemp2?.area : null
    } else {
      phone = (await this.weiboToPhone())?.phone
      if (phone) {
        weibo = this.message
        this.message = phone
        const arrTemp2 = await this.phoneToQq()
        if (arrTemp2) {
          qq = arrTemp2.qq
          location = arrTemp2.location
          this.message = qq as string
          qqOldPass = await this.qqToOldPass()
          const arrTemp3 = await this.qqToLol()
          lol = arrTemp3?.id
          area = lol ? arrTemp3?.area : null
        }
      } else {
        const arrTemp2 = await this.phoneToQq()
        if (arrTemp2) {
          qq = arrTemp2.qq
          phone = this.message
          location = arrTemp2.location
          weibo = (await this.phoneToWeibo())?.id
          this.message = qq as string
          qqOldPass = await this.qqToOldPass()
          const arrTemp3 = await this.qqToLol()
          lol = arrTemp3?.id
          area = lol ? arrTemp3?.area : null
        } else {
          const arrTemp3 = await this.lolToQq()
          if (arrTemp3) {
            qq = arrTemp3.qq
            area = arrTemp3.area
            const arrTemp4 = await this.qqToPhone()
            if (arrTemp4) {
              phone = arrTemp4.phone
              location = arrTemp4.location
            }
            this.message = qq as string
            qqOldPass = await this.qqToOldPass()
          }
        }
      }
    }
    return { qq, lol, phone, qqOldPass, location, area, weibo }
  }
}

export default Sed
