import { obj } from '../function';
declare class Event {
    private on_private_msg;
    private on_group_msg;
    private handleEventList;
    registerEvent: (list: [string, Function][], eventName: string, callback: Function) => void;
    handleEvent: (list: [string, Function][], data: obj) => void;
}
export default Event;
