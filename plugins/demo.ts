export default (Event: any, Api: any) => {
    /* 处理函数 */
    function handel(data: any) {
        /* 处理消息 */
        const message: string = data.message.split('echo ')[1];
        /* 发送 */
        message && Api.send_group_msg(message, data.group_id);
    }

    /* 事件监听注册 */
    Event.listen("on_group_msg", handel);
    Event.listen("on_private_msg", (data: any) => {
        const message: string = data.message.split('print ')[1];
        message && Api.send_private_msg(message, data.user_id);
    });
};
