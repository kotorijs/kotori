// ../../tsup.config.ts
import { log } from "node:console";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "tsup";
function getFileJson(file) {
  const filepath = resolve(process.cwd(), file);
  if (!existsSync(filepath)) return {};
  const str = readFileSync(filepath, "utf-8");
  let json;
  try {
    json = JSON.parse(str);
  } catch (e) {
    throw new Error(`Parse Error at ${filepath}: ${String(e)}`);
  }
  return json;
}
var tsup_config_default = defineConfig((options) => {
  if (!options.silent) log("Dir:", process.cwd());
  const [tsconfig, pkg] = ["tsconfig.json", "package.json"].map((file) => getFileJson(file));
  return {
    entryPoints: ["./src"],
    outDir: tsconfig?.compilerOptions?.outDir ?? "./dist",
    bundle: false,
    banner: {
      js: `
/**
 * @Package ${pkg?.name ?? "unknown"}
 * @Version ${pkg?.version ?? "unknown"}
 * @Author ${Array.isArray(pkg?.author) ? pkg.author.join(", ") : pkg?.author ?? ""}
 * @Copyright 2024 Hotaru. All rights reserved.
 * @License ${pkg?.license ?? "GPL-3.0"}
 * @Link https://github.com/kotorijs/kotori
 * @Date ${(/* @__PURE__ */ new Date()).toLocaleString()}
 */
`
    },
    clean: !!process.argv.find((el) => el === "--define.env=prod")
  };
});
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vdHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiRjpcXFxccHJvamVjdC1zZWxmXFxcXHJlcG9zXFxcXGtvdG9yaS1ib3RcXFxcdHN1cC5jb25maWcudHNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiRjpcXFxccHJvamVjdC1zZWxmXFxcXHJlcG9zXFxcXGtvdG9yaS1ib3RcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL0Y6L3Byb2plY3Qtc2VsZi9yZXBvcy9rb3RvcmktYm90L3RzdXAuY29uZmlnLnRzXCI7aW1wb3J0IHsgbG9nIH0gZnJvbSAnbm9kZTpjb25zb2xlJ1xyXG5pbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMgfSBmcm9tICdub2RlOmZzJ1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAnbm9kZTpwYXRoJ1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd0c3VwJ1xyXG5cclxuLy8gYmlvbWUtaWdub3JlIGxpbnQ6XHJcbmZ1bmN0aW9uIGdldEZpbGVKc29uKGZpbGU6IHN0cmluZyk6IFBhcnRpYWw8UmVjb3JkPHN0cmluZywgYW55Pj4ge1xyXG4gIGNvbnN0IGZpbGVwYXRoID0gcmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBmaWxlKVxyXG4gIGlmICghZXhpc3RzU3luYyhmaWxlcGF0aCkpIHJldHVybiB7fVxyXG4gIGNvbnN0IHN0ciA9IHJlYWRGaWxlU3luYyhmaWxlcGF0aCwgJ3V0Zi04JylcclxuICAvLyBiaW9tZS1pZ25vcmUgbGludDpcclxuICBsZXQganNvbjogYW55XHJcbiAgdHJ5IHtcclxuICAgIGpzb24gPSBKU09OLnBhcnNlKHN0cilcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBhcnNlIEVycm9yIGF0ICR7ZmlsZXBhdGh9OiAke1N0cmluZyhlKX1gKVxyXG4gIH1cclxuICByZXR1cm4ganNvblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKG9wdGlvbnMpID0+IHtcclxuICBpZiAoIW9wdGlvbnMuc2lsZW50KSBsb2coJ0RpcjonLCBwcm9jZXNzLmN3ZCgpKVxyXG5cclxuICBjb25zdCBbdHNjb25maWcsIHBrZ10gPSBbJ3RzY29uZmlnLmpzb24nLCAncGFja2FnZS5qc29uJ10ubWFwKChmaWxlKSA9PiBnZXRGaWxlSnNvbihmaWxlKSlcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGVudHJ5UG9pbnRzOiBbJy4vc3JjJ10sXHJcbiAgICBvdXREaXI6IHRzY29uZmlnPy5jb21waWxlck9wdGlvbnM/Lm91dERpciA/PyAnLi9kaXN0JyxcclxuICAgIGJ1bmRsZTogZmFsc2UsXHJcbiAgICBiYW5uZXI6IHtcclxuICAgICAganM6IGBcclxuLyoqXHJcbiAqIEBQYWNrYWdlICR7cGtnPy5uYW1lID8/ICd1bmtub3duJ31cclxuICogQFZlcnNpb24gJHtwa2c/LnZlcnNpb24gPz8gJ3Vua25vd24nfVxyXG4gKiBAQXV0aG9yICR7QXJyYXkuaXNBcnJheShwa2c/LmF1dGhvcikgPyBwa2cuYXV0aG9yLmpvaW4oJywgJykgOiBwa2c/LmF1dGhvciA/PyAnJ31cclxuICogQENvcHlyaWdodCAyMDI0IEhvdGFydS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICogQExpY2Vuc2UgJHtwa2c/LmxpY2Vuc2UgPz8gJ0dQTC0zLjAnfVxyXG4gKiBATGluayBodHRwczovL2dpdGh1Yi5jb20va290b3JpanMva290b3JpXHJcbiAqIEBEYXRlICR7bmV3IERhdGUoKS50b0xvY2FsZVN0cmluZygpfVxyXG4gKi9cclxuYFxyXG4gICAgfSxcclxuICAgIGNsZWFuOiAhIXByb2Nlc3MuYXJndi5maW5kKChlbCkgPT4gZWwgPT09ICctLWRlZmluZS5lbnY9cHJvZCcpXHJcbiAgfVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNQLFNBQVMsV0FBVztBQUMxUSxTQUFTLFlBQVksb0JBQW9CO0FBQ3pDLFNBQVMsZUFBZTtBQUN4QixTQUFTLG9CQUFvQjtBQUc3QixTQUFTLFlBQVksTUFBNEM7QUFDL0QsUUFBTSxXQUFXLFFBQVEsUUFBUSxJQUFJLEdBQUcsSUFBSTtBQUM1QyxNQUFJLENBQUMsV0FBVyxRQUFRLEVBQUcsUUFBTyxDQUFDO0FBQ25DLFFBQU0sTUFBTSxhQUFhLFVBQVUsT0FBTztBQUUxQyxNQUFJO0FBQ0osTUFBSTtBQUNGLFdBQU8sS0FBSyxNQUFNLEdBQUc7QUFBQSxFQUN2QixTQUFTLEdBQUc7QUFDVixVQUFNLElBQUksTUFBTSxrQkFBa0IsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLEVBQUU7QUFBQSxFQUM1RDtBQUNBLFNBQU87QUFDVDtBQUVBLElBQU8sc0JBQVEsYUFBYSxDQUFDLFlBQVk7QUFDdkMsTUFBSSxDQUFDLFFBQVEsT0FBUSxLQUFJLFFBQVEsUUFBUSxJQUFJLENBQUM7QUFFOUMsUUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxZQUFZLElBQUksQ0FBQztBQUV6RixTQUFPO0FBQUEsSUFDTCxhQUFhLENBQUMsT0FBTztBQUFBLElBQ3JCLFFBQVEsVUFBVSxpQkFBaUIsVUFBVTtBQUFBLElBQzdDLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxNQUNOLElBQUk7QUFBQTtBQUFBLGNBRUksS0FBSyxRQUFRLFNBQVM7QUFBQSxjQUN0QixLQUFLLFdBQVcsU0FBUztBQUFBLGFBQzFCLE1BQU0sUUFBUSxLQUFLLE1BQU0sSUFBSSxJQUFJLE9BQU8sS0FBSyxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7QUFBQTtBQUFBLGNBRXJFLEtBQUssV0FBVyxTQUFTO0FBQUE7QUFBQSxZQUU1QixvQkFBSSxLQUFLLEdBQUUsZUFBZSxDQUFDO0FBQUE7QUFBQTtBQUFBLElBR2xDO0FBQUEsSUFDQSxPQUFPLENBQUMsQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLE9BQU8sT0FBTyxtQkFBbUI7QUFBQSxFQUMvRDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
