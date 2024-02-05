import { Loader } from '@kotori-bot/loader';
import { obj } from '@kotori-bot/core';

(globalThis as obj).env_mode = 'build';

const kotori = new Loader();
kotori.run();
