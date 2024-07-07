import type I18n from "@kotori-bot/i18n";
import type { Context } from "fluoro";
import type Api from "./api";
import {
  MessageScope,
  type CommandResult,
  type AdapterConfig,
  type EventDataTargetId,
  type EventApiType,
} from "../types";
import Elements from "./elements";
import {
  cancelFactory,
  confirmFactory,
  formatFactory,
  promptFactory,
  quickFactory,
  sendMessageFactory,
} from "../utils/factory";
import CommandError from "../utils/commandError";
import { Symbols } from "../global";

interface AdapterStatus {
  value: "online" | "offline";
  createTime: Date;
  lastMsgTime: Date | null;
  receivedMsg: number;
  sentMsg: number;
  offlineTimes: number;
}

interface AdapterImpl<T extends Api = Api> {
  readonly ctx: Context;
  readonly config: AdapterConfig;
  readonly platform: string;
  readonly selfId: EventDataTargetId;
  readonly identity: string;
  readonly api: T;
  readonly elements: Elements;
  readonly status: AdapterStatus;
}

function setProxy<T extends Api>(api: Api, ctx: Context): T {
  const proxy = Object.create(api) as T;
  proxy.sendPrivateMsg = new Proxy(api.sendPrivateMsg, {
    apply(_, __, argArray) {
      const [message, targetId] = argArray;
      const cancel = cancelFactory();
      ctx.emit("before_send", {
        api,
        message,
        messageType: MessageScope.PRIVATE,
        targetId,
        cancel: cancel.get(),
      });
      if (cancel.value) return;
      api.sendPrivateMsg(message, targetId, argArray[2]);
    },
  });
  proxy.sendGroupMsg = new Proxy(api.sendGroupMsg, {
    apply(_, __, argArray) {
      const [message, targetId] = argArray;
      const cancel = cancelFactory();
      ctx.emit("before_send", {
        api,
        message,
        messageType: MessageScope.PRIVATE,
        targetId,
        cancel: cancel.get(),
      });
      if (cancel.value) return;
      api.sendGroupMsg(message, targetId, argArray[2]);
    },
  });
  return proxy;
}

function error<K extends keyof CommandResult>(
  type: K,
  data?: CommandResult[K]
) {
  return new CommandError(
    Object.assign(data ?? {}, { type }) as ConstructorParameters<
      typeof CommandError
    >[0]
  );
}

export abstract class Adapter<T extends Api = Api> implements AdapterImpl<T> {
  public constructor(
    ctx: Context,
    config: AdapterConfig,
    identity: string,
    Api: new (adapter: Adapter) => T,
    el: Elements = new Elements()
  ) {
    this.ctx = ctx;
    this.config = config;
    this.identity = identity;
    this.platform = config.extends;
    this.api = setProxy(new Api(this), this.ctx);
    this.elements = el;
    if (!this.ctx[Symbols.bot].get(this.platform))
      this.ctx[Symbols.bot].set(this.platform, new Set());
    this.ctx[Symbols.bot].get(this.platform)!.add(this.api);
  }

  public abstract handle(...data: unknown[]): void;

  public abstract start(): void;

  public abstract stop(): void;

  public abstract send(
    action: string,
    params?: object
  ): void | object | Promise<unknown> | null | undefined;

  protected online() {
    if (this.status.value !== "offline") return;
    this.status.value = "online";
    this.ctx.emit("status", { adapter: this, status: "online" });
  }

  protected offline() {
    if (this.status.value !== "online") return;
    this.status.value = "offline";
    this.status.offlineTimes += 1;
    this.ctx.emit("status", { adapter: this, status: "offline" });
  }

  protected session<N extends keyof EventApiType>(
    type: N,
    data: Omit<
      EventApiType[N],
      | "api"
      | "send"
      | "i18n"
      | "format"
      | "quick"
      | "prompt"
      | "confirm"
      | "el"
      | "error"
    >
  ) {
    const i18n = this.ctx.i18n.extends(this.config.lang);
    const send = sendMessageFactory(this, type, data);
    const format = formatFactory(i18n as I18n);
    const quick = quickFactory(send, i18n as I18n);
    const prompt = promptFactory(quick, this, data);
    const confirm = confirmFactory(quick, this, data);
    const { api, elements: el } = this;
    this.ctx.emit(
      type,
      ...([
        { ...data, api, el, send, i18n, format, quick, prompt, confirm, error },
      ] as unknown as [...Parameters<(typeof this)["ctx"]["emit"]>])
    );
  }

  public readonly ctx: Context;

  public readonly config: AdapterConfig;

  public readonly identity: string;

  public readonly platform: string;

  public readonly api: T;

  public readonly elements: Elements;

  public readonly status: AdapterStatus = {
    value: "offline",
    createTime: new Date(),
    lastMsgTime: null,
    receivedMsg: 0,
    sentMsg: 0,
    offlineTimes: 0,
  };

  selfId: EventDataTargetId = -1;
}

export default Adapter;
