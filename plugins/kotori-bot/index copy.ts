/*
 * @Author: Biyuehu biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-15 16:41:22
 */
import os from 'os';
import { EventDataType, obj, Event, Api, Const } from 'src/interface';
import { getPackageInfo, loadConfig, saveConfig, stringProcess, stringSplit } from '../../src/function';
import { Res } from './interface';
import { dealCpu, dealRam, dealTime, URL, URL2 } from './method';
import config from './config';

export default (Event: Event, Api: Api, Const: Const) => {
    Event.listen("on_group_msg", handler);
    Event.listen("on_private_msg", handler);
    async function handler(data: EventDataType) {
        /* 群聊开关检测 */
        if (data.message_type === 'group' && config.group.state === true) {
            if (!stringProcess(<number>data.group_id, config.group.list)) return;
        }

        const message = data.message;
        let result = 'Kotori-Bot:';
        let target = '';
        const send = (msg: string = result) => {
            if (data.message_type === 'private') {
                Api.send_private_msg(msg, data.user_id)
            } else {
                Api.send_group_msg(msg, <number>data.group_id)
            }

        };
        const strp = (prefix: string) => {
            target = stringSplit(data.message, prefix);
            return stringProcess(data.message, prefix);
        };

        if (message === '菜单' || message === '/menu' || message === '/help' || message.includes('kotori')) {
            result += '\n日常工具 查询工具';
            result += '\n随机图片 随机语录';
            result += '\nGPT聊天 群管系统';
            result += '\n特殊功能 关于BOT';
        } else if (message === '日常工具') {
            result += '\n发送指令时无需带[]';
            result += '\n/music [歌名*序号]: 网易云点歌,序号不填默认为1,例子:歌名*2';
            result += '\n/star [星座名]: 查看今日星座运势';
            result += '\n/translate [内容]: 中英互译';
            result += '\n/lunar: 查看农历';
            result += '\n/story: 查看历史上的今天';
        } else if (message === '查询工具') {
            result += '\n发送指令时无需带[]';
            result += '\n/motd [IP:端口]: MCJE服务器信息查询';
            result += '\n/motdpe [IP:端口]: MCBE服务器信息查询';
            result += '\n/mcskin [游戏ID]: MC正版账号皮肤查询';
            result += '\n/bili [BV号]: B站视频信息查询';
            result += '\n/sed [QQ/手机号]: 社工信息查询';
            result += '\n/idcard [身份证号]: 身份证信息查询';
            result += '\n/hcb [ID]: 韦一云黑信息查询';
            result += '\n/state [URL]: 网站状态查询';
            result += '\n/speed [URL]: 网站速度测试';
        } else if (message === '随机图片') {
            result += '\n/sex [TAG]: 来自pixiv,TAG可选';
            result += '\n/sexh [TAG]: 来自huliimg,TAG可选';
            result += '\n/seller: 卖家秀图片';
            result += '\n/sedimg: 诱惑图';
            result += '\n/bing: 必应每日图';
            result += '\n/day: 每日看世界';
            result += '\n/earth: 实时地球';
            result += '\n/china: 实时中国';
            // result += '\n/sister: 随机小姐姐视频';
            result += '\n/qrcode [内容]: 二维码生成';
        } else if (message === '随机语录') {
            result += '\n一言 一言2';
            result += '\n骚话 情话 ';
            result += '\n笑话 诗词';
            result += '\n毒鸡汤 网抑云';
            result += '\n人生语录 社会语录';
            result += '\n温柔语录 舔狗语录';
            result += '\n爱情语录 个性签名';
            result += '\n经典语录 英汉语录';
        } else if (message === 'GPT聊天') {
            result += '\n发送指令时无需带[]';
            result += '\n/gpt [内容]: ChatGPT聊天';
            result += '\n/cl [内容]: Claude聊天';
        } else if (message === '群管系统') {
            result += '\n以下功能仅群内且有权限时可用';
            result += '\n发送指令时无需带[]';
            result += '\n/ban [QQ*倍率]: 禁言某人,默认10min,填2就是20min;不填QQ默认全体禁言';
            result += '\n/unban [QQ]: 解禁某人;不填QQ默认解除全体禁言';
            result += '\n/kick [QQ]: 踢出某人';
            result += '\n/all [内容]: 发送全体成员消息';
            result += '\n/notice [内容]: 发送群公告';
        } else if (message === '特殊功能') {
            result += '\n/api: 查看API站点数据';
        } else if (message === '关于BOT') {
            result += '\n/help: 帮助信息';
            result += '\n/status: 查看BOT运行状态';
            result += '\n/about: 关于机器人框架';
        } else {
            result = '';
        }

        if (result.length > 0) {
            send();
            return
        }

        /* 日常工具 */
        else if (strp('/music ')) {
            const arr = target.split('*');
            target = arr[0];
            const num = arr[1] ? parseInt(arr[1]) : 1;
            fetch(`${URL}netease?name=${target}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        const song = res.data[num - 1];
                        if (song) {
                            let msg = `歌曲ID：${song.songid}\n歌曲标题：${song.title}\n歌曲作者 :${song.author}`;
                            msg += `\n歌曲下载：${song.url}\n歌曲封面：[CQ:image,file=${song.pic}]`;
                            send(msg);
                            send(`[CQ:music,type=163,id=${song.songid}]`);
                        } else send(`序号错误！`);
                    } else if (res.code === 502) {
                        send('没有找到相应歌曲');
                    } else {
                        send(target ? '接口错误！请联系管理员' : '参数不能为空');
                    }
                });
        } else if (strp('/star ')) {
            fetch(`${URL}starluck?msg=${target}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        let msg = `${(<obj>res.data).name}今日运势：`;
                        (<obj>res.data).info.forEach((element: string) => {
                            msg += `\n${element}`;
                        });
                        (<obj>res.data).index.forEach((element: string) => {
                            msg += `\n${element}`;
                        });
                        send(msg);
                    } else if (res.code === 501) {
                        send('星座错误！');
                    } else {
                        send(target ? '接口错误！请联系管理员' : '参数不能为空');
                    }
                });
        } else if (strp('/translate ')) {
            fetch(`${URL}fanyi?msg=${target}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.data) {
                        send(`原文：${target}\n译文：${res.data}`);
                    } else {
                        send(target ? '接口错误！请联系管理员' : '参数不能为空');
                    }
                });
        } else if (message === '/lunar') {
            fetch(`${URL}lunar`)
                .then(res => res.text())
                .then(res => {
                    send(res);
                });
        } else if (message === '/story') {

        }
        /* 查询工具 */
        else if (strp('/motd ')) {
            const arr = target.split(':');
            arr[1] = arr[1] ?? 25565;
            fetch(`${URL}motd?ip=${arr[0]}&port=${arr[1]}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        let msg = `状态：在线\nIP：${(<obj>res.data).real}\n端口：${(<obj>res.data).port}`;
                        msg += `\n物理地址：${(<obj>res.data).location}\nMOTD：${(<obj>res.data).motd}`;
                        msg += `\n协议版本：${(<obj>res.data).agreement}\n游戏版本：${(<obj>res.data).version}`;
                        msg += `\n在线人数：${(<obj>res.data).online} / ${(<obj>res.data).max}`;
                        msg += `\n延迟：${(<obj>res.data).ping}ms`;
                        send(msg + `\n图标：${(<obj>res.data).icon ?
                            `[CQ:image,file=base64://${(<obj>res.data).icon.substring(22)}]` : '无'}`);
                    } else if (typeof res.code === 'number') {
                        send(`状态：离线\nIP：${arr[0]}\n端口：${arr[1]}`);
                    } else {
                        send(target ? '接口错误！请联系管理员' : '参数不能为空');
                    }
                });
        } else if (strp('/motdpe ')) {
            const arr = target.split(':');
            arr[1] = arr[1] ?? 19132;
            fetch(`${URL}motdpe?ip=${arr[0]}&port=${arr[1]}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        let msg = `状态：在线\nIP：${(<obj>res.data).real}\n端口：${(<obj>res.data).port}`;
                        msg += `\n物理地址：${(<obj>res.data).location}\nMOTD：${(<obj>res.data).motd}`;
                        msg += `\n游戏模式：${(<obj>res.data).gamemode}\n协议版本：${(<obj>res.data).agreement}`;
                        msg += `\n游戏版本：${(<obj>res.data).version}`;
                        msg += `\n在线人数：${(<obj>res.data).online} / ${(<obj>res.data).max}`;
                        send(msg + `\n延迟：${(<obj>res.data).delay}ms`);
                    } else if (typeof res.code === 'number') {
                        send(`状态：离线\nIP：${arr[0]}\n端口：${arr[1]}`);
                    } else {
                        send(target ? '接口错误！请联系管理员' : '参数不能为空');
                    }
                });
        } else if (strp('/mcskin ')) {
            fetch(`${URL}mcskin?name=${target}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        let msg = `玩家：${target}\n皮肤：[CQ:image,file=${(<obj>res.data).skin}]`;
                        msg += `\n披风：${(<obj>res.data).cape ? `[CQ:image,file=${(<obj>res.data).cape}]` : '无'}`;
                        msg += `\n头颅：${(<obj>res.data).avatar ?
                            `[CQ:image,file=base64://${(<obj>res.data).avatar.substring(22)}]` : '无'}`;
                        send(msg);
                    } else if (res.code === 502) {
                        send('查无此人！');
                    } else {
                        send(target ? '接口错误！请联系管理员' : '参数不能为空');
                    }
                });
        } else if (strp('/bili ')) {
            fetch(`${URL}biligetv?msg=${target}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        let msg = `BV号：${(<obj>res.data).bvid}\nAV号：${(<obj>res.data).aid}`;
                        msg += `\n视频标题：${(<obj>res.data).title}\n视频简介：${(<obj>res.data).descr}`;
                        msg += `\n作者UID：${(<obj>res.data).owner.uid}\n视频封面：[CQ:image,file=${(<obj>res.data).pic}]`;
                        send(msg);
                    } else if (res.code === 502) {
                        send('未找到该视频');
                    } else {
                        send(target ? '接口错误！请联系管理员' : '参数不能为空');
                    }
                });
        } else if (strp('/sed ')) {
            if (target === data.self_id.toString()) {
                send('未查询到相关记录');
                return;
            }
            fetch(`${URL}sed?msg=${target}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        let msg = `查询内容：${target}\n消耗时间：${Math.floor(res.takeTime)}秒\n记录数量：${res.count}`;
                        msg += (<obj>res.data).qq ? `\nQQ：${(<obj>res.data).qq}` : '';
                        msg += (<obj>res.data).phone ? `\n手机号：${(<obj>res.data).phone}` : '';
                        msg += (<obj>res.data).location ? `\n运营商：${(<obj>res.data).location}` : '';
                        msg += (<obj>res.data).id ? `\nLOLID：${(<obj>res.data).id}` : '';
                        msg += (<obj>res.data).area ? `\nLOL区域：${(<obj>res.data).area}` : '';
                        send(msg)
                    } else if (res.code === 501) {
                        send('未查询到相关记录');
                    } else {
                        send('接口错误！请联系管理员');
                    }
                });
        } else if (strp('/idcard ')) {
            fetch(`${URL}idcard?msg=${target}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        let msg = `身份证号：${target}\n性别：${(<obj>res.data).gender}\n`;
                        msg += `出生日期：${(<obj>res.data).birthday}\n年龄：${(<obj>res.data).age}`;
                        msg += `\n省份：${(<obj>res.data).province}\n地址：${(<obj>res.data).address}`;
                        send(msg + `\n${(<obj>res.data).starsign}`);
                    } else if (res.code === 501) {
                        send('身份证号错误');
                    } else {
                        send('接口错误！请联系管理员');
                    }
                });
        } else if (strp('/hcb ')) {
            fetch(`https://hcb.imlolicon.tk/api/v3?value=${target}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        if (<boolean>(<obj>res.data).status) {
                            let imgs = '';
                            if ((<obj>res.data).imgs !== null) {
                                (<string[]>(<obj>res.data).imgs).forEach(element => {
                                    imgs += `[CQ:image,file=${element}]`;
                                });
                            }
                            let msg = `${target}有云黑记录\nUUID：${(<obj>res.data).uuid}`;
                            msg += `\n用户平台：${(<obj>res.data).plate}\n用户ID：${(<obj>res.data).idkey}`;
                            msg += `\n记录描述：${(<obj>res.data).descr}\n记录等级：${(<obj>res.data).level}`;
                            msg += `\n记录时间：${(<obj>res.data).date}\n相关图片：${imgs ? imgs : '无'}`;
                            send(msg);
                        } else {
                            send(`${target}无云黑记录`);
                        }
                    } else if (res.code === 501) {
                        send('参数不能为空');
                    } else {
                        send('接口错误！请联系管理员');
                    }
                });
        } else if (strp('/state ')) {
            fetch(`${URL}webtool?op=1&url=${target}`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (strp('/speed ')) {
            fetch(`${URL}webtool?op=3&url=${target}`)
                .then(res => res.text())
                .then(res => send(res));
        }
        /* 随机图片 */
        else if (message === '/sex' || strp('/sex ')) {
            fetch(`${URL2}seimg/v2/${target ? `?tag=${target}` : ''}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        const dd = res.data[0];
                        let tags = '';
                        dd.tags.forEach((element: string) => {
                            tags += `、${element}`;
                        });
                        let msg = `PID:${dd.pid}\n标题:${dd.title}\n作者:${dd.author}\n标签:${tags.substring(1)}`;
                        send(msg + `\n[CQ:image,file=${dd.url}]`);
                    } else if (res.code === 501) {
                        send('未找到相应图片');
                    } else {
                        send('接口错误！请联系管理员');
                    }
                });
        } else if (message === '/sexh' || strp('/sexh ')) {
            fetch(`${URL2}huimg/${target ? `?tag=${target}` : ''}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        const dd = <obj>res.data;
                        let tag = '';
                        (<string[]>dd.tag).forEach(element => {
                            tag += `、${element}`;
                        });
                        send(`标签:${tag.substring(1)}\n[CQ:image,file=${dd.url}]`);
                    } else if (res.code === 501) {
                        send('未找到相应图片');
                    } else {
                        send('接口错误！请联系管理员');
                    }
                });
        } else if (message === '/seller') {
            send(`[CQ:image,file=${URL}sellerimg]`);
        } else if (message === '/sedimg') {
            send(`[CQ:image,file=${URL}sedimg]`);
        } else if (message === '/bing') {
            send(`[CQ:image,file=${URL}bing]`);
        } else if (message === '/day') {
            send(config.apikey.day ? `[CQ:image,file=${URL}60s?apikey=${config.apikey.day}]` : '请先配置APIKEY！');
        } else if (message === '/earth') {
            send(`[CQ:image,file=https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg]`);
        } else if (message === '/china') {
            send(`[CQ:image,file=https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg]`);
        } else if (message === '/sister') {
            send(`[CQ:video,file=${URL}sisters]`);
        } else if (strp('/qrcode ')) {
            send(`[CQ:image,file=${URL}qrcode?text=${target}&amp;frame=2&amp;size=200&e=L]`);
        }
        /* 随机语录 */
        else if (message === '一言') {
            fetch(`${URL2}hitokoto/v2/`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        let msg = `${(<obj>res.data).msg}${(<obj>res.data).from ? `——${(<obj>res.data).from}` : ''}`;
                        send(msg + `\n类型：${(<obj>res.data).type}`);
                    } else {
                        send('接口错误！请联系管理员');
                    }
                });
        } else if (message === '一言2') {
            fetch(`${URL}words?msg=1&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '骚话') {
            fetch(`${URL}words?msg=2&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '情话') {
            fetch(`${URL}words?msg=3&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '笑话') {
            fetch(`${URL}words?msg=7&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '诗词') {
            fetch(`${URL}words?msg=16&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '毒鸡汤') {
            fetch(`${URL}words?msg=6&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '网抑云') {
            fetch(`${URL}words?msg=8&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '人生语录') {
            fetch(`${URL}words?msg=4&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '社会语录') {
            fetch(`${URL}words?msg=5&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '温柔语录') {
            fetch(`${URL}words?msg=9&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '舔狗语录') {
            fetch(`${URL}words?msg=10&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '爱情语录') {
            fetch(`${URL}words?msg=11&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '个性签名') {
            fetch(`${URL}words?msg=15&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '经典语录') {
            fetch(`${URL}words?msg=14&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        } else if (message === '英汉语录') {
            fetch(`${URL}words?msg=15&format=text`)
                .then(res => res.text())
                .then(res => send(res));
        }
        /* GPT聊天 */
        else if (strp('/gpt ')) {
            fetch(`${URL}?=${target}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        send(``)
                    } else if (res.code === 502) {
                        send('');
                    } else {
                        send(target ? '接口错误！请联系管理员' : '参数不能为空');
                    }
                });
        } else if (strp('/cl ')) {
            send('该功能维修中');
            /* 
            fetch(`${URL}?=${target}`)
                .then(res => res.json())
                .then((res: Res) => {
                    if (res.code === 500 && res.data) {
                        send(``)
                    } else if (res.code === 502) {
                        send('');
                    } else {
                        send(target ? '接口错误！请联系管理员' : '参数不能为空');
                    }
                }); */
        } else if (message === '/api') {
            fetch(`https://api.imlolicon.tk/sys/datastat?format=text`)
                .then(res => res.text())
                .then(res => send(res));
        }
        /* 关于BOT */
        else if (message === '/status') {
            const cpuData = dealCpu();
            const ramData = dealRam();
            const BOT = Const._BOT;
            const STAT = BOT.status.stat;
            const info = getPackageInfo();
            result = `服务器信息：\n系统内核：${os.type()}\n系统平台：${os.platform()}\nCPU架构：${os.arch()}\nCPU型号：`;
            result += `${cpuData.model}\nCPU频率：${cpuData.speed.toFixed(2)}GHz\nCPU核心数：${cpuData.num}`;
            result += `\nCPU使用率：${cpuData.rate.toFixed(2)}%\n内存总量：${ramData.total.toFixed(2)}GB\n可用内存：`;
            result += `${ramData.used.toFixed(2)}GB\n内存使用率：${ramData.rate.toFixed(2)}%\n网卡数量：`;
            result += `${Object.keys(os.networkInterfaces()).length}\n开机时间：${dealTime()}\n主机名字：${os.hostname()}`;
            result += `\n系统目录：${os.homedir()}\nBOT信息：\nBOTQQ：${BOT.self_id}\n连接时间：${BOT.connect}`;
            result += `\n接收包数量：${STAT.packet_received}\n发送包数量：${STAT.packet_sent}\n丢失包数量：${STAT.packet_lost}`;
            result += `\n接收消息数量：${STAT.message_received}\n发送消息数量：${STAT.message_sent}`;
            result += `\n连接丢失次数：${STAT.lost_times}\n连接断开次数：${STAT.disconnect_times}`;
            result += `\n框架信息：\n当前BOT框架版本：${info.version}\n框架协议：${info.license}`;
            send(result + `\n-------ByHimeno-------`);
        } else if (message === '/about') {
            const info = getPackageInfo();
            let msg = `你说得对，但是KotoriBot是一个go-cqhttp的基于NodeJS+TypeScript的SDK和QQ机器人框架实现\n`;
            msg += `开源地址：https://github.com/biyuehu/kotori-bot\n\n当前BOT框架版本：${info.version}`;
            msg += `\n框架协议：${info.license}\n[CQ:image,file=https://biyuehu.github.io/images/avatar.png]`;
            send(msg + `\n-------ByHimeno-------`);
        }
        /* 群管系统 */
        else if (data.message_type === 'group') {
            if (message === '/ban' || strp('/ban ')) {

            } else if (message === '/unban' || strp('/unban ')) {

            } else if (strp('/kick ')) {

            } else if (strp('/all ')) {

            } else if (strp('/notice ')) {

            }
        }
    }
}
