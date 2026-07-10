// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
var blog = defineDocs({
  dir: "content/blog"
});
var source_config_default = defineConfig();
export {
  blog,
  source_config_default as default
};
