declare const _default: {
    cmd_prefix: string;
    chat_prefix: string;
    cmd: {
        help: string;
        status: string;
        state: string;
        start: string;
        stop: string;
        rest: string;
        stopex: string;
        run: string;
    };
    group_id: number;
    mangers: number[];
    info: {
        name: string;
        port: number;
        group_name: string;
    };
    mcsm: {
        address: string;
        uuid: string;
        remote_uuid: string;
        apikey: string;
    };
    wss: {
        port: number;
    };
    other: {
        check_ip_time: number;
    };
    message: {
        not_manger: string;
    };
};
export default _default;
