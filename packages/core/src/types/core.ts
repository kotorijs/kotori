export type EventsList = {
  [K in keyof EventsMapping]: Parameters<EventsMapping[K]>[1] extends never | undefined | null
    ? Parameters<EventsMapping[K]>[0]
    : [...Parameters<EventsMapping[K]>];
};

export interface EventsMapping {
  ready(): void;
  error(data: EventDataError): void;
  dispose(): void;
}

interface EventDataError {
  error: unknown;
}
