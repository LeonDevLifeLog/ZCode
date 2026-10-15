import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { BuildEnvironment, createIdResolver, normalizePath, resolveConfig } from "vite";

describe("Share Vite shared 公共入口解析", () => {
  const shareRoot = resolve(import.meta.dirname, "..");
  let environment: BuildEnvironment;
  let resolveId: ReturnType<typeof createIdResolver>;

  beforeAll(async () => {
    const config = await resolveConfig(
      { configFile: resolve(shareRoot, "vite.config.ts"), logLevel: "silent" },
      "build",
      "production",
    );
    environment = new BuildEnvironment("client", config);
    resolveId = createIdResolver(config);
  });

  it.each([
    ["@zcode/shared", "index.ts"],
    ["@zcode/shared/mcp-apps", "mcp-apps/index.ts"],
    ["@zcode/shared/zcode-protocol-v4", "zcode-protocol-v4/index.ts"],
    ["@zcode/shared/model-config", "model-config.ts"],
    ["@zcode/shared/config-schema", "config-schema.ts"],
  ])("将 %s 解析到公共源码入口", async (specifier, sourcePath) => {
    // 文件别名曾把 shared 子路径拼到 index.ts 后；使用真实 Vite resolver 防止再次回归。
    expect(await resolveId(environment, specifier, resolve(shareRoot, "src/main.tsx"))).toBe(
      normalizePath(resolve(shareRoot, "../shared/src", sourcePath)),
    );
  });
});
