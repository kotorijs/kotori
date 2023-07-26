export interface Config {
    host: string;
    port: number;
    app: {
        updatetime: number
    }
}

declare const config: Config;

export default config;