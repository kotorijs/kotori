# @kotori-bot/kotori-plugin-status

## Config

```typescript
interface Config {
  template?: string;
}
```

### Default

```text
服务器运行状态\n系统内核：%type%\n系统平台：%platform%\nCPU架构：%arch%\nCPU型号：%model%\nCPU频率：%speed%GHz\nCPU核心数：%num%\nCPU使用率：%cpu_rate%%\n内存总量：%total%GB\n可用内存：%used%GB\n内存使用率：%ram_rate%%\n网卡数量：%network%\n开机时间：%time%\n主机名字：%hostname%\n系统目录：%homedir%
```

## Commands

- `/status` View server running status

## Reference

- [Kotori Docs](https://kotori.js.org/)
