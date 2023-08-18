> MCSM官网:[https://mcsmanager.com/](https://mcsmanager.com/)
> 搭建完成后填入`config.ts`配置即可，推荐MCSM、KotoriBot、BDS均运行在同一主机上

-   BDS先装好`LiteLoader`，下载地址去[minebbs](https://minebbs.com)找
-   将`mcserver.js`文件放入BDS的plugins/目录下
-   mcserver.js为LiteLoader插件，用于监听玩家进出服务器、死亡、消息，同时用于发送指令、消息
-   MCSM用于启动、停止、重启服务器、查看主机状态
-   查看服务器状态使用motdpe方式，只要配置了服务器端口就能用
