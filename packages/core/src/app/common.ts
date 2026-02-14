import { type EventsList as FluoroEventsList, Service as FluoroService } from 'fluoro'
import type { EventsMapping } from '../types/events'
import type Context from './core'

export type EventsList = FluoroEventsList<EventsMapping>

export type Service<T extends object = object> = FluoroService<T, Context>

export const Service = FluoroService as new <T extends object = object>(
  ctx: Context,
  config: T,
  identity: string
) => Service<T>
