import { transform } from "esbuild";

export const rawTsPlugin = () => {
  return {
    name: "vite-plugin-raw-ts",
    async transform(src: string, id: string) {
      if (id.endsWith("?tsraw")) {
        console.log(src);
        const { code } = await transform(src, {
          loader: "ts",
          format: "esm",
        });
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: null,
        };
      }
    },
  };
};
