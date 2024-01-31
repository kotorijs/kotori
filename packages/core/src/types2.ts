export interface ApiExtra {
  default: { type: 'default' };
}

export type ApiExtraValue = (ApiExtra & { any: { type: Exclude<string, keyof ApiExtra> } & Omit<obj, 'type'> })[
  | keyof ApiExtra
  | 'any'];

/* 
export type EventsList = { [P in keyof EventAfterType]: EventAfterType[P]} & { 
    [P in `before_${keyof EventBeforeType}`]: EventBeforeType[T extends `before_${infer R}` ? R : T];
} */

export interface DevErrorExtra {
  path: string;
  type: 'warning' | 'info' | 'error';
}
