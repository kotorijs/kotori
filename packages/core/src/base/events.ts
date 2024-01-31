import { Events as EventsOrigin } from '@kotori-bot/tools';
import { EventsList } from '../types';

declare module '../context' {
  interface Context extends EventsOrigin<EventsList> {}
}

export const Events = EventsOrigin<EventsList>;
export default Events;
