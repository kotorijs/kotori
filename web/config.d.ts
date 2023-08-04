export interface Config {
    host: string;
    port: number | null;
    app: {
        updatetime: number
    }
}

declare const config: Config;

export default config;