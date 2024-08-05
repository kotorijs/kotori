import Kotori from 'kotori-bot'

const headers = {
  'user-agent': 'czy0729/Bangumi/6.4.0 (Android) (http://github.com/czy0729/Bangumi)'
}

export const http: typeof Kotori.http.get = async (url, params) =>
  Kotori.http.get(`https://api.bgm.tv/${url}`, params, { headers })

export default http
