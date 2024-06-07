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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vdHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiRjpcXFxccHJvamVjdC1zZWxmXFxcXHJlcG9zXFxcXGtvdG9yaS1ib3RcXFxcdHN1cC5jb25maWcudHNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiRjpcXFxccHJvamVjdC1zZWxmXFxcXHJlcG9zXFxcXGtvdG9yaS1ib3RcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL0Y6L3Byb2plY3Qtc2VsZi9yZXBvcy9rb3RvcmktYm90L3RzdXAuY29uZmlnLnRzXCI7aW1wb3J0IHsgbG9nIH0gZnJvbSAnbm9kZTpjb25zb2xlJztcclxuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdub2RlOnBhdGgnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd0c3VwJztcclxuXHJcbi8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXHJcbmZ1bmN0aW9uIGdldEZpbGVKc29uKGZpbGU6IHN0cmluZyk6IFBhcnRpYWw8UmVjb3JkPHN0cmluZywgYW55Pj4ge1xyXG4gIGNvbnN0IGZpbGVwYXRoID0gcmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBmaWxlKTtcclxuICBpZiAoIWV4aXN0c1N5bmMoZmlsZXBhdGgpKSByZXR1cm4ge307XHJcbiAgY29uc3Qgc3RyID0gcmVhZEZpbGVTeW5jKGZpbGVwYXRoLCAndXRmLTgnKTtcclxuICBsZXQganNvbjtcclxuICB0cnkge1xyXG4gICAganNvbiA9IEpTT04ucGFyc2Uoc3RyKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBhcnNlIEVycm9yIGF0ICR7ZmlsZXBhdGh9OiAke1N0cmluZyhlKX1gKTtcclxuICB9XHJcbiAgcmV0dXJuIGpzb247XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygob3B0aW9ucykgPT4ge1xyXG4gIGlmICghb3B0aW9ucy5zaWxlbnQpIGxvZygnRGlyOicsIHByb2Nlc3MuY3dkKCkpO1xyXG5cclxuICBjb25zdCBbdHNjb25maWcsIHBrZ10gPSBbJ3RzY29uZmlnLmpzb24nLCAncGFja2FnZS5qc29uJ10ubWFwKChmaWxlKSA9PiBnZXRGaWxlSnNvbihmaWxlKSk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBlbnRyeVBvaW50czogWycuL3NyYyddLFxyXG4gICAgb3V0RGlyOiB0c2NvbmZpZz8uY29tcGlsZXJPcHRpb25zPy5vdXREaXIgPz8gJy4vZGlzdCcsXHJcbiAgICBidW5kbGU6IGZhbHNlLFxyXG4gICAgYmFubmVyOiB7XHJcbiAgICAgIGpzOiBgXHJcbi8qKlxyXG4gKiBAUGFja2FnZSAke3BrZz8ubmFtZSA/PyAndW5rbm93bid9XHJcbiAqIEBWZXJzaW9uICR7cGtnPy52ZXJzaW9uID8/ICd1bmtub3duJ31cclxuICogQEF1dGhvciAke0FycmF5LmlzQXJyYXkocGtnPy5hdXRob3IpID8gcGtnLmF1dGhvci5qb2luKCcsICcpIDogcGtnPy5hdXRob3IgPz8gJyd9XHJcbiAqIEBDb3B5cmlnaHQgMjAyNCBIb3RhcnUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqIEBMaWNlbnNlICR7cGtnPy5saWNlbnNlID8/ICdHUEwtMy4wJ31cclxuICogQExpbmsgaHR0cHM6Ly9naXRodWIuY29tL2tvdG9yaWpzL2tvdG9yaVxyXG4gKiBARGF0ZSAke25ldyBEYXRlKCkudG9Mb2NhbGVTdHJpbmcoKX1cclxuICovXHJcbmBcclxuICAgIH0sXHJcbiAgICBjbGVhbjogISFwcm9jZXNzLmFyZ3YuZmluZCgoZWwpID0+IGVsID09PSAnLS1kZWZpbmUuZW52PXByb2QnKVxyXG4gIH07XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNQLFNBQVMsV0FBVztBQUMxUSxTQUFTLFlBQVksb0JBQW9CO0FBQ3pDLFNBQVMsZUFBZTtBQUN4QixTQUFTLG9CQUFvQjtBQUc3QixTQUFTLFlBQVksTUFBNEM7QUFDL0QsUUFBTSxXQUFXLFFBQVEsUUFBUSxJQUFJLEdBQUcsSUFBSTtBQUM1QyxNQUFJLENBQUMsV0FBVyxRQUFRLEVBQUcsUUFBTyxDQUFDO0FBQ25DLFFBQU0sTUFBTSxhQUFhLFVBQVUsT0FBTztBQUMxQyxNQUFJO0FBQ0osTUFBSTtBQUNGLFdBQU8sS0FBSyxNQUFNLEdBQUc7QUFBQSxFQUN2QixTQUFTLEdBQUc7QUFDVixVQUFNLElBQUksTUFBTSxrQkFBa0IsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLEVBQUU7QUFBQSxFQUM1RDtBQUNBLFNBQU87QUFDVDtBQUVBLElBQU8sc0JBQVEsYUFBYSxDQUFDLFlBQVk7QUFDdkMsTUFBSSxDQUFDLFFBQVEsT0FBUSxLQUFJLFFBQVEsUUFBUSxJQUFJLENBQUM7QUFFOUMsUUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxZQUFZLElBQUksQ0FBQztBQUV6RixTQUFPO0FBQUEsSUFDTCxhQUFhLENBQUMsT0FBTztBQUFBLElBQ3JCLFFBQVEsVUFBVSxpQkFBaUIsVUFBVTtBQUFBLElBQzdDLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxNQUNOLElBQUk7QUFBQTtBQUFBLGNBRUksS0FBSyxRQUFRLFNBQVM7QUFBQSxjQUN0QixLQUFLLFdBQVcsU0FBUztBQUFBLGFBQzFCLE1BQU0sUUFBUSxLQUFLLE1BQU0sSUFBSSxJQUFJLE9BQU8sS0FBSyxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7QUFBQTtBQUFBLGNBRXJFLEtBQUssV0FBVyxTQUFTO0FBQUE7QUFBQSxZQUU1QixvQkFBSSxLQUFLLEdBQUUsZUFBZSxDQUFDO0FBQUE7QUFBQTtBQUFBLElBR2xDO0FBQUEsSUFDQSxPQUFPLENBQUMsQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLE9BQU8sT0FBTyxtQkFBbUI7QUFBQSxFQUMvRDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
