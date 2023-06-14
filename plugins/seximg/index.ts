import config from './config';
import needle from 'needle';

const url: string[] = [
    'https://imlolicon.tk/api/seimg/v2/',
    'https://imlolicon.tk/api/huimg/'
]

function arr(val: any[]) {
    let temp: string = '';
    val.forEach((value: any) => {
        temp += value;
    })
    return temp;
}

const log = (...args:any) => console.log('[SexImg]', ...args);

export default (Event: any, Api: any) => {
    const params = {
        r18: config.r18 ? '1' : '0'
    }

    const method = (data: any) => {
        function send(msg: string) {
            data.message_type === 'group' ? Api.send_group_msg(msg, data.group_id) : Api.send_private_msg(msg, data.user_id);
        }

        if (data.message === '.sex' || data.message === '.sexh') {
            send('涩图来咯...Σ(￣ロ￣lll)');

            const type = data.message == '.sex' ? 0 : 1;
            needle('get', url[type], params).then((d: any) => {
                d = d.body;
                if (d.code !== 500) {
                    send('涩图获取失败(╥_╥)\nCode:' + d.code);
                    log(d)
                    return;
                }

                let dd: any = d.data,
                    msg: string;
                if (type === 0) {
                    dd = dd[0];
                    msg = `PID:${dd.pid}\n标题:${dd.title}\n作者:${dd.author}\n标签:${arr(dd.tags)}\n[CQ:image,file=${dd.url}]`;
                } else {
                    msg = `标签:${arr(dd.tag)}\n[CQ:image,file=${dd.url}]`;
                }
                log(msg);
                send(msg);
            }).catch(err => {
                send('发送失败,未知的错误(ノДＴ)');
                log(err)
            })
        } else if (data.message === '.sexc') {
            send(`【SEX IMG | 配置项】\n图片源:\n.sex [Pixiv]\n.sexh [糊狸IMG]\n非全年龄 [${config.r18 ? '开' : '关'}]\nBy Hotaru`)
        }
    }


    Event.listen('on_private_msg', method);
    Event.listen('on_group_msg', method);
};
