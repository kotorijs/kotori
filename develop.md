## 插件开发

**KotoriBot**提供了一个简约的插件扩展机制，目前已支持go-cqhttp提供的67种**接口(API)**和?种监听**事件(Event)**

插件主要分为单文件插件与多文件插件，前者代码量相对少仅需一个TS脚本文件放入`plugins/`即可，不需要`标识文件`与依赖库，后者则需要一个文件夹包裹放入，但无论如何，更推荐使用后方案

> 注意:单文件插件的名字和多文件插件的文件夹名字将作为该插件的唯一标识符

新建文件夹`plugins/nemusic/`

标识文件:`@/manifest.json`,该文件在一定程度上参考了某个游戏

```json
{
    // 所有参数均为可选，包括该文件，将在插件加载时在控制台输出信息
    "name": "网易云点歌", // 插件名字
    "descr": "在群聊或私聊发送“点歌[歌名]”即可", // 插件描述
    "version": "0.0.1", // 插件版本
    "author": "hotaru", // 插件作者
    "license": "MIT" // 插件开源协议
}
```

依赖项文件:`@/dependencies`,源自于nodejs,当编写插件时也不免会引入一些别的库,而该文件也在于此,相对于简化版的`package.json`

```json
{
    "dependencies": {
        "needle": "^3.2.0"
    }
}
```

入口文件:`@/index.ts`

```typescript
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

```

关于Event.listen监听事件与Api接口与CQ码等内容请参考[go-cqhttp文档](https://docs.go-cqhttp.org/)

> index.ts将作为多文件插件下默认加载的入口文件

### 构建您的插件

如有转换成JS或向下兼容的需求，仍可运行:

```bash
npm run build
```


## 基于KotoriBot开发您自己的BOT

```typescript
import kotori from 'kotori-bot';
// CommonJS: const kotori = require('kotori-bot');

/* 配置 */
/**
 * @param mode 连接类型
 * 剩余参数则由mode决定
 * 具体配置参数含义参考前文
 */
const config = {
    mode: 'WsReverse' as 'WsReverse',// 这傻逼TS这都要报错
    port: 8080
    /* 如果为Ws */
    /**
     * mode: 'Ws',
     * url: 'ws://localhost',
     * port: 8888,
     * retry_time: 10
    */
   /* 如果为Http */
    /**
     * mode: 'Http',
     * url: 'ws://localhost',
     * port: 8888,
     * reverse_port: 8080,
     * retry_time: 10
    */
}

/**
 * 类似于插件里的export default传参，但该处不会传入Const
 */
const func = (Event: any, Api: any) => {
    /* ...参考前文... */
}

/* 实例化 */
const MyBot = new kotori(config, func);

/* 创建并运行 */
MyBot.create();

```

