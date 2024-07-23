declare module "*.json" {
  // biome-ignore lint: noExplicitAny
  const value: Record<string, any>;
  export default value;
}
