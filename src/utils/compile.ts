import { compile } from "../wasm";
import { devServerURL, enableDevServer } from "./env";

export async function blve_compile(
  code: string,
  runtimePath?: string
): Promise<{
  js: string | undefined;
  css: string | undefined;
  err: string | undefined;
}> {
  try {
    if (!enableDevServer) {
      const { js, css } = compile(code, runtimePath);
      return {
        js: js,
        css: css,
        err: undefined,
      };
    } else {
      const res = await fetch(`${devServerURL}/compile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          runtimePath,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to compile: ${res.statusText}`);
      }
      const { js, css } = await res.json();
      return {
        js: js,
        css: css,
        err: undefined,
      };
    }
  } catch (e) {
    return {
      err: String(e),
      js: undefined,
      css: undefined,
    };
  }
}
