import 'reflect-metadata'
import type { OptsOrigin, MidwareCallback, RegexpCallback, TaskOptions } from '../types'
import { Symbols } from '../global'
import type { Command } from '../components'
import type { CronJob } from 'cron'
import type { ModuleConfig } from 'fluoro'

declare module 'fluoro' {
  interface EventsMapping {
    literal_ready_module_decorator(name: string, config: ModuleConfig): void
  }
}

export function cancelFactory() {
  return {
    get() {
      return () => this.fn()
    },
    fn() {
      this.value = true
    },
    value: false
  }
}

// biome-ignore lint:
type CommandOriginData = Command<any, OptsOrigin>['meta']

interface CommandMeta extends CommandOriginData {
  identity?: string
}

interface MidwareMeta {
  identity?: string
  priority: number
}

interface RegExpMeta {
  identity?: string
  match: RegExp
}

interface TaskMeta {
  identity?: string
  task: CronJob
  options: TaskOptions
}

// biome-ignore lint:
export function getCommandMeta(command: Command<any, any>): CommandMeta | undefined {
  return Reflect.getMetadata(Symbols.command, command)
}

// biome-ignore lint:
export function setCommandMeta(command: Command<any, any>, meta: CommandMeta) {
  Reflect.defineMetadata(Symbols.command, meta, command)
}

export function getMidwareMeta(callback: MidwareCallback): MidwareMeta | undefined {
  return Reflect.getMetadata(Symbols.midware, callback)
}

export function setMidwareMeta(callback: MidwareCallback, meta: MidwareMeta) {
  Reflect.defineMetadata(Symbols.midware, meta, callback)
}

export function getRegExpMeta(callback: RegexpCallback): RegExpMeta | undefined {
  return Reflect.getMetadata(Symbols.regexp, callback)
}

export function setRegExpMeta(callback: RegexpCallback, meta: RegExpMeta) {
  Reflect.defineMetadata(Symbols.regexp, meta, callback)
}

export function getTaskMeta(task: CronJob): TaskMeta | undefined {
  return Reflect.getMetadata(Symbols.task, task)
}

export function setTaskMeta(task: CronJob, meta: TaskMeta) {
  Reflect.defineMetadata(Symbols.task, meta, task)
}

export default {
  getCommandMeta,
  setCommandMeta,
  getMidwareMeta,
  setMidwareMeta,
  getRegExpMeta,
  setRegExpMeta,
  getTaskMeta,
  setTaskMeta
}
