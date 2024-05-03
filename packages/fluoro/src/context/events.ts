import { Events } from '@kotori-bot/tools';

declare module './context' {
  interface Context {
    emit: Events<EventsMapping>['emit'];
    parallel: Events<EventsMapping>['parallel'];
    on: Events<EventsMapping>['on'];
    once: Events<EventsMapping>['once'];
    off: Events<EventsMapping>['off'];
    offAll: Events<EventsMapping>['offAll'];
  }
}

export type EventsList = {
  [K in keyof EventsMapping]: Parameters<EventsMapping[K]>[1] extends never | undefined | null
    ? Parameters<EventsMapping[K]>[0]
    : [...Parameters<EventsMapping[K]>];
};

export interface EventsMapping {
  ready(): void;
  dispose(): void;
}
