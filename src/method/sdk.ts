import * as M from "@/interface";

export class sdk {
    public static send_cq = (cq: M.Message): string => {
        let data: string = '';
        Object.keys(cq.data).forEach(key => {
            data += `,${key}=${cq.data[key]}`;
        });
        return `[CQ:${cq.type}${data}]`;
    }

    public static send_image = (file: string) => {
        const data: M.MessageImage = { file };
        return this.send_cq({
            type: 'image',
            data
        });
    }

    public static send_music = (type: M.MessageMusic['type'], id: string) => {
        const data: M.MessageMusic = { type, id };
        return this.send_cq({
            type: 'image',
            data
        });
    }
}

export default sdk;