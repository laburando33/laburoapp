module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@repo/utils": "../../packages/utils",
            "@components": "../../packages/ui/components",
            "@lib/web-supabase": "../../packages/utils/supabase-web.ts",
            "@lib/mobile-supabase": "../../packages/utils/supabase-mobile.ts"
          },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
        }
      ]
    ]
  };
};
