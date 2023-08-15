import config from './config';
import core from './core';
import { Cmd, args } from 'plugins/kotori-core';
import { ACCESS, SCOPE } from 'plugins/kotori-core/interface';

Cmd.register(config.cmd, config.descr, 'queryTool', SCOPE.ALL, ACCESS.NORMAL, send => {
    const Entity = new core(args[1]);
    Entity.run();
    const content = Entity.results;
    send(config.info, {
        content
    });
}, [
    {
        must: true, name: config.args[0]
    }
]);
