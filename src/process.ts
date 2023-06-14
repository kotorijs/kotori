import Process from 'child_process';

export const execute = (cmd: string, args?: any[]) => Process.spawn(cmd, {
    detached: true, 
    windowsHide: true,
    stdio: 'ignore'
});

export const exec = (file: string, info?: string) => Process.exec(file , (error) => {
    if (error) {
        console.error(error);
    } else if (info) {
        console.log(info);
    }
});

export default {
    execute,
    exec
}