import { Http } from 'kotori-bot'

const req = new Http()

const headers = {
  'user-agent': 'czy0729/Bangumi/6.4.0 (Android) (http://github.com/czy0729/Bangumi)'
}

export const http: typeof req.get = async (url, params) => req.get(`https://api.bgm.tv/${url}`, params, { headers })

export default http
