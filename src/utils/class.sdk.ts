/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-26 18:47:45
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-18 15:31:12
 */
import * as M from '@/tools/type';

class SDK {
	public static sdk_cq_t = (cq: M.Message): string => {
		let data: string = '';
		Object.keys(cq.data).forEach(key => {
			if (typeof key === 'symbol') return;
			let val = (cq.data as M.obj)[key];
			if (typeof val === 'string') {
				val = val.replace(/&/, '&amp;');
				val = val.replace(/\[/, '&#91;');
				val = val.replace(/]/, '&#93;');
				val = val.replace(/,/, '&#44;');
			}
			data += `,${key}=${val as string}`;
		});
		const result = `[CQ:${cq.type}${data}]`;
		return result;
	};

	public static sdk_cq_j: M.FuncSdkCq = (type, data) => ({
		type,
		data,
	});

	private static sdk_cq: M.FuncSdkCq<string> = (type, data) => {
		const result: M.Message = this.sdk_cq_j(type, data);
		return this.sdk_cq_t(result);
	};

	/**
	 * @description: QQ表情
	 * @param {M.MessageFaceId} id QQ表情ID
	 * @return {*}
	 */
	public static cq_face = (id: M.MessageFaceId) => {
		const data: M.MessageFace = { id };
		return this.sdk_cq('face', data);
	};

	/**
	 * @description: 语音
	 * @param {string} target 语音文件名或语音URL
	 * @param {0 | 1} magic 默认0, 设置为1表示变声
	 * @param {0 | 1} cache 只在通过网络URL发送时有效,表示是否使用已缓存的文件,默认1
	 * @param {0 | 1} proxy 只在通过网络URL发送时有效,表示是否通过代理下载文件(需通过环境变量或配置文件配置代理),默认1
	 * @param {number} timeout 只在通过网络URL发送时有效,单位秒,表示下载网络文件的超时时间,默认不超时
	 * @return {*}
	 */
	public static cq_record = (
		target: string,
		timeout?: number,
		magic: 0 | 1 = 0,
		cache: 0 | 1 = 1,
		proxy: 0 | 1 = 1,
	) => {
		const data: M.MessageRecord = target.includes('http')
			? {
					file: target,
					url: target,
					cache,
					proxy,
					timeout,
			  }
			: {
					file: target,
					magic,
			  };
		return this.sdk_cq('record', data);
	};

	/**
	 * @description: 短视频
	 * @param {string} file 视频地址,支持http和file发送
	 * @param {string} cover 视频封面,支持http,file和base64发送, 格式必须为jpg
	 * @param {M.MessageVideo['c']} c 通过网络下载视频时的线程数,默认单线程.(在资源不支持并发时会自动处理)
	 * @return {*}
	 */
	public static cq_video = (file: string, cover?: string, c: M.MessageVideo['c'] = 1) => {
		const data: M.MessageVideo = { file, cover, c };
		return this.sdk_cq('video', data);
	};

	/**
	 * @description: at某人
	 * @param {M.MessageAt['qq']} qq at的QQ号,all表示全体成员
	 * @return {*}
	 */
	// * @param {string} name 当在群中找不到此QQ号的名称时才会生效
	public static cq_at = (qq: M.MessageAt['qq'] /* , name?: string */) => {
		const data: M.MessageAt = { qq };
		return this.sdk_cq('at', data);
	};

	/**
	 * @description: 链接分享
	 * @param {string} url URL
	 * @param {string} title 标题
	 * @param {string} content 发送时可选,内容描述
	 * @param {string} image 发送时可选,图片URL
	 * @return {*}
	 */
	public static cq_share = (url: string, title: string, content?: string, image?: string) => {
		const data: M.MessageShare = { url, title, content, image };
		return this.sdk_cq('share', data);
	};

	/**
	 * @description: 音乐分享
	 * @param {M.MessageMusic['type']} type 分别表示使用QQ音乐、网易云音乐、虾米音乐
	 * @param {string} id 歌曲ID
	 * @return {*}
	 */
	public static cq_Music = (type: M.MessageMusic['type'], id: string) => {
		const data: M.MessageMusic = { type, id };
		return this.sdk_cq('music', data);
	};

	/**
	 * @description: 音乐自定义分析
	 * @param {string} url 点击后跳转目标URL
	 * @param {string} audio 音乐URL
	 * @param {string} title 标题
	 * @param {string} content 发送时可选,内容描述
	 * @param {string} image 发送时可选,图片URL
	 * @return {*}
	 */
	public static cq_music_custom = (url: string, audio: string, title: string, content?: string, image?: string) => {
		const data: M.MessageMusicCustom = {
			type: 'custom',
			url,
			audio,
			title,
			content,
			image,
		};
		return this.sdk_cq('music', data);
	};

	/**
	 * @description: 图片
	 * @param {string} file 图片文件名
	 * @param {M.MessageImage['type']} type 图片类型,flash表示闪照,show表示秀图,默认普通图片
	 * @param {M.MessageImage['subType']} subType 图片子类型,只出现在群聊.
	 * @param {string} url 图片URL
	 * @param {M.MessageImage['cache']} cache 只在通过网络URL发送时有效,表示是否使用已缓存的文件,默认1
	 * @param {M.MessageImage['id']} id 发送秀图时的特效id,默认为40000
	 * @param {M.MessageImage['c']} c 通过网络下载图片时的线程数,默认单线程(在资源不支持并发时会自动处理)
	 * @return {*}
	 */
	public static cq_image = (
		file: string,
		subType?: M.MessageImage['subType'],
		url?: string,
		type: M.MessageImage['type'] = 'normal',
		cache: M.MessageImage['cache'] = 1,
		id: M.MessageImage['id'] = 40000,
		c: M.MessageImage['c'] = 1,
	) => {
		const data: M.MessageImage = {
			file,
			type,
			subType,
			url,
			cache,
			id,
			c,
		};
		return this.sdk_cq('image', data);
	};

	/**
	 * @description: 回复
	 * @param {number} id 回复时所引用的消息id,必须为本群消息.
	 * @param {string} text 自定义回复的信息
	 * @param {number} qq 自定义回复时的自定义QQ,如果使用自定义信息必须指定.
	 * @param {number} time 自定义回复时的时间,格式为Unix时间
	 * @param {number} seq 起始消息序号,可通过get_msg获得
	 * @return {*}
	 */
	public static cq_reply = (id: number, text: string, qq?: number, time?: number, seq?: number) => {
		const data: M.MessageReply = { id, text, qq, time, seq };
		return this.sdk_cq('reply', data);
	};

	/**
	 * @description: 红包(收)
	 * @param {string} title 祝福语/口令
	 * @return {*}
	 */
	public static cq_red_bag = (title: string) => {
		const data: M.MessageRedbag = { title };
		return this.sdk_cq('redbag', data);
	};

	/**
	 * @description: 戳一戳(发)
	 * @param {number} qq 需要戳的成员
	 * @return {*}
	 */
	public static cq_poke = (qq: number) => {
		const data: M.MessagePoke = { qq };
		return this.sdk_cq('poke', data);
	};

	/**
	 * @description: 礼物
	 * @param {number} qq 接受礼物的成员
	 * @param {M.MessageGift['id']} id 礼物的类型
	 * @return {*}
	 */
	public static cq_gift = (qq: number, id: M.MessageGift['id']) => {
		const data: M.MessageGift = { qq, id };
		return this.sdk_cq('gift', data);
	};

	/**
	 * @description: 合并转发
	 * @param {string} id 合并转发ID,需要通过/get_forward_msgAPI获取转发的具体内容
	 * @return {*}
	 */
	public static cq_forward = (id: string) => {
		const data: M.MessageForward = { id };
		return this.sdk_cq('forward', data);
	};

	/**
	 * @description: 合并转发消息节点
	 * @param {number} id 转发消息id,直接引用他人的消息合并转发,实际查看顺序为原消息发送顺序 与下面的自定义消息二选一
	 * @param {string} name 发送者显示名字,用于自定义消息(自定义消息并合并转发,实际查看顺序为自定义消息段顺序)
	 * @param {number} uin 发送者QQ号,用于自定义消息
	 * @param {M} content 具体消息,用于自定义消息不支持转发套娃
	 * @param {M} seq 具体消息,用于自定义消息
	 * @return {*}
	 */
	public static cq_forward_node = (id: number, name?: string, uin?: number, content?: M.Message, seq?: M.Message) => {
		const data: M.MessageNode =
			typeof name === 'string' &&
			typeof uin === 'number' &&
			typeof content === 'object' &&
			typeof seq === 'object'
				? { name, uin, content, seq }
				: { id };
		return this.sdk_cq('node', data);
	};

	/**
	 * @description: XML消息
	 * @param {string} dat xml内容,xml中的value部分,记得实体化处理
	 * @param {M} resid 可能为空,或空字符串
	 * @return {*}
	 */
	public static cq_xml = (dat: string, resid?: M.MessageXml['resid']) => {
		const data: M.MessageXml = { data: dat, resid };
		return this.sdk_cq('xml', data);
	};

	/**
	 * @description: JSON消息
	 * @param {string} dat json内容,json的所有字符串记得实体化处理
	 * @param {number} resid 默认不填为0,走小程序通道,填了走富文本通道发送
	 * @return {*}
	 */
	public static cq_json = (dat: string, resid: number = 0) => {
		const data: M.MessageJson = { data: dat, resid };
		return this.sdk_cq('json', data);
	};

	public static cq_cardimage = (
		file: string,
		icon?: string,
		minwidth: number = 400,
		minheight: number = 400,
		maxwidth: number = 500,
		maxheight: number = 500,
		source: string = '',
	) => {
		const data: M.MessageCardImage = {
			file,
			minwidth,
			minheight,
			maxwidth,
			maxheight,
			source,
			icon,
		};
		return this.sdk_cq('cardimage', data);
	};

	/**
	 * @description: TTS 通过TX的TTS接口,采用的音源与登录账号的性别有关
	 * @param {string} text 内容
	 * @return {*}
	 */
	public static cq_tts = (text: string) => {
		const data: M.MessageTts = { text };
		return this.sdk_cq('tts', data);
	};

	public static get_at = (message: string): number | null => {
		const match = message.match(/\[CQ:at,qq=(\d+)]/);
		return match ? parseInt(match[1], 10) : null;
	};

	public static get_image = (message: string): string | null => {
		const match = message.match(/\[CQ:image,file=([^]+])/);
		return match ? match[1] : null;
	};
}

export default SDK;
