import { Loader } from '@kotori-bot/loader';

(globalThis as unknown as { env_mode: string }).env_mode = 'build';

const kotori = new Loader();
kotori.run();
