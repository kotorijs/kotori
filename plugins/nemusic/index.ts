import config from './config';
// 可导入各种东西
import needle from 'needle';
// 一个简易的http请求库
import { stringProcess, stringSplit } from '../../src/function';
// 该文件为Kotori-Bot提供的工具库，提供了一些简单的方法
// 具体内容参考后文

/**
 * @param {any} Event 事件
 * @param {any} Api 接口
 * @param {any} Const 常量(可选)
 */
export default (Event: any, Api: any) => {
    /**
     * Event对象只有Event.listen一个方法 负责注册监听事件
     * @param {string} EventName 事件名
     * @param {Function} callback 回调函数 会为其传入data参数,该参数包含了触发事件的相关信息
     */
    Event.listen("on_group_msg", handel); // 注册群消息监听事件
    Event.listen("on_private_msg", handel); // 注册私聊消息监听事件

    /* 处理函数 */
    async function handel(data: any) {
        /* 处理消息 */
        let message: string = data.message;
        /* 使用stringProcess函数检测消息开头是否为'点歌' 否则return停止函数执行 */
        if (!stringProcess(message, '点歌')) return;
        /* 使用stringSplit函数切割'点歌'右边的字符串 */
        message = stringSplit(message, '点歌');
        /* 切割后的message不能为空 */
        if (!message) return;
        /* 获取音乐数据 */
        const req = await getMusicInfo(message);
        const reqData = req.body.data;
        let content: string = '';
        /* 判断是否请求成功且有数据 */
        if (req.body.code === 500 && reqData.id !== null) {
            // 别问为什么是500,问就是看接口文档
            // https://api.imlolicon.tk/iluh/nemusic
            content += `歌曲ID:${reqData.id}`;
            content += `歌曲名字:${reqData.name}`;
            content += `歌手名字:${reqData.singer}`;
            content += `歌曲链接:${reqData.url}`;
            // [CQ:XXX,...]为CQ码 此处用于发送图片
            content += `歌曲封面:[CQ:image,url=${reqData.url}]`;
        } else {
            content += '呜呜呜┭┮﹏┭┮\n接口获取失败';
        }
        /* 判断消息类型以发送相应类型消息 */
        if (data.message_type === 'group') {
            // 发送群消息: 消息内容 群号
            Api.send_group_msg(content, data.group_id);
        }
        if (data.message_type === 'private') {
            // 发送私聊消息: 消息内容 QQ号
            Api.send_private_msg(content, data.private_id);
        }
    }

    /* 获取音乐信息 */
    function getMusicInfo(musicName: string) {
        // 此处可不引入needle,使用原生的fetch()方法
        return needle('get', `https://api.imlolicon.tk/api/nemusic?msg=${musicName}&line=1`);
    }
};
