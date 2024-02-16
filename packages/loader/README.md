# @kotori-bot/core

```typescript
interface Context {
  readonly baseDir: Runner['baseDir'];
  readonly options: Runner['options'];
  readonly [Symbols.modules]: Runner[typeof Symbols.modules];
  loadAll(): void;
  watcher(): void;
  logger: Logger;
  /* Service */
  server: Server;
  db: Database;
  file: File;
}
```

- Loader
- Runner
- Server
- Database
- File
- log

## Reference

- [Kotori Docs](https://kotori.js.org/)
