import vm from 'vm';

class SandboxJs {
    public results = '';
    private code: string;
    private record = (...args: unknown[]) => {
        this.results += args.map(arg => {
            switch (typeof arg) {
                case 'object': return JSON.stringify(arg);
                case 'undefined': return 'undefined';
                default: return arg;
            }
        }) + '\n';
    };
    private method = {
        console: {
            log: this.record,
            info: this.record,
            error: this.record,
            warn: this.record,
        }
    };

    public constructor(code: string) {
        this.code = code;
    }

    public run = () => {
        try {
            vm.runInNewContext(this.code, this.method);
        } catch (error: unknown) {
            this.results += ('Uncaught SyntaxError: ' + (error as Error).message);
        }
    }
}