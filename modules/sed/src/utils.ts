import Kotori from 'kotori-bot';

class Sed {
  message: string;

  async qqToPhone() {
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/qqapi?qq=${this.message}`)) as Record<string, any>;
    if (data.status !== 200) return null;
    return {
      phone: data.phone,
      location: data.phonediqu
    };
  }

  async qqToLol() {
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/qqlol?qq=${this.message}`)) as Record<string, any>;
    if (data.status !== 200) return null;
    return {
      id: data.name,
      area: data.daqu
    };
  }

  async qqToOldPass() {
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/qqlm?qq=${this.message}`)) as Record<string, any>;
    if (data.status !== 200) return null;
    return data.qqlm;
  }

  async phoneToQq() {
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/qqphone?phone=${this.message}`)) as Record<string, any>;
    if (data.status !== 200) return null;
    return {
      qq: data.qq,
      location: data.phonediqu
    };
  }

  async phoneToWeibo() {
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/wbphone?phone=${this.message}`)) as Record<string, any>;
    // ...
  }

  async weiboToPhone() {
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/wbapi?id=${this.message}`)) as Record<string, any>;
    // ...
  }

  async lolToQq() {
    const data = (await Kotori.http.get(`https://zy.xywlapi.cc/lolname?id=${this.message}`)) as Record<string, any>;
    // ...
  }

  async toIdcard() {
    const data = (await Kotori.http.get(`https://api.hotaru.icu/api/idcard?msg=${this.message}`)) as Record<
      string,
      any
    >;
    // ...
  }

  async sedQuery() {
    // 业务逻辑

    return {
      code: 200,
      message: 'success',
      takeTime: 0.1,
      count: 3,
      data: {
        qq: '12345',
        phone: '13800001111'
      }
    };
  }
}

const sed = new Sed();

sed.sedQuery().then((res) => {
  // 处理结果
});
