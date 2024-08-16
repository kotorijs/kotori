import type Context from './core'
import { Service as FluoroService, type EventsList as FluoroEventsList } from 'fluoro'
import type { EventsMapping } from '../types/events'

export type EventsList = FluoroEventsList<EventsMapping>

export type Service<T extends object = object> = FluoroService<T, Context>

export const Service = FluoroService as new <T extends object = object>(
  ctx: Context,
  config: T,
  identity: string
) => Service<T>
