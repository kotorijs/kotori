# 搭建指南

## 关于go-cqhttp

go-cqhttp官网:[https://docs.go-cqhttp.org/](https://docs.go-cqhttp.org/)

> 请自行搭建[go-cqhttp](https://github.com/Mrs4s/go-cqhttp)及其[签名服务器](https://github.com/fuqiuluo/unidbg-fetch-qsign)，并配置好相关参数

## 环境搭建

前往`[NodeJS官网](https://nodejs.org)`下载并安装Node

## 下载安装

-   **包管理器**
选择你喜欢的包管理器进行安装
    ```bash
    npm install kotori-bot
    pnpm install kotori-bot
    yarn add kotori-bot
    ```

-   **Git克隆**

    ```bash
    git clone https://github.com/BIYUEHU/kotori-bot.git
    ```

-   **手动下载**
转到*Release*页面,选择最新的tags下载

下载完成后，在根目录运行以安装所有依赖库

```bash
npm install
```

### 配置
```yaml
connect:
    # 连接模式 可选: http ws ws-reverse 推荐首选ws-reverse
    mode: ws-reverse
    # Go-cqhttp里设置的访问密钥 未设置则忽略(暂未支持)
    access-token: ''

    # Http正反向(暂未支持)
    http:
        url: 'http://localhost' # 正向Http地址
        port: 8888 # 正向Http端口
        reverse-port: 8080 # 反向Http端口
        retry-time: 10 # 连接断开或失败时尝试重连间隔时间 单位:秒

    # WebSocket正向
    ws:
        url: 'ws://localhost' # WS地址
        port: 8888 # WS端口
        retry-time: 10 # 同上

    # WebSocket反向(相对于Gocqhttp)
    ws-reverse:
        port: 8080 # WS反向端口

control:
    program: './go-cqhttp/go-cqhttp.exe'
    params: [] # '-update-protocol'
    signserver: './signserver/start.bat'

# 暂未实现
bot:
    # 机器人主人QQ号(拥有调试权限)
    master: 123
    # 私聊事件过滤设置(权重最高的开启/关闭好友)
    users:
        type: 0 # 0不过滤 1黑名单 2白名单
        list: [] # 过滤的QQ
    # 同上 过滤群
    groups:
        type: 0
        list: []
```
### 运行模式

-   生产环境运行

```bash
npm run start
```

-   开发环境运行

```bash
npm run serve
```

-   开发环境运行(nodemon)

```bash
npm run dev
```

### 启动
#### Windows
双击运行`start.bat`即可

#### Linux
1.cd进kotori目录
2.输入`./start`

### 插件下载与安装

> [插件中心](./PLUGINS.md)

将插件根文件夹或单文件放置在`plugins/`目录下，Kotori会自动加载该目录下的所有相关文件

收集插件将不定期更新，你可以直接通过**Pull Request**的方式将你的插件加入(或更新时)到仓库并更新`docs/PLUGINS.md`中的插件列表信息
