/* import fs from 'fs';

const file = './test2.ts';
import(file);

fs.watchFile(file, async () => {
	console.log(require.cache[require.resolve(file)]);
	delete require.cache[require.resolve(file)];
	console.log(await import(file));
});
 */
import test2 from './test/test2';

test2();
