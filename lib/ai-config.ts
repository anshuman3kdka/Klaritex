import fs from "fs";
import path from "path";
import type { AnalysisMode } from "@/lib/types";

export type AIProvider = "gemini";

interface AIConfig {
  quick_provider: AIProvider;
  deep_provider: AIProvider;
}

const CONFIG_PATH = path.join(process.cwd(), "content/settings/api-config.json");

const CONFIG_CACHE_TTL_MS = 1000;

const DEFAULT_CONFIG: AIConfig = {
  quick_provider: "gemini",
  deep_provider: "gemini",
};

let cachedConfig: AIConfig = DEFAULT_CONFIG;
let cacheExpiresAt = 0;

function isValidProvider(v: unknown): v is AIProvider {
  return v === "gemini";
}

function parseAIConfig(raw: string): AIConfig {
  const parsed = JSON.parse(raw) as Partial<AIConfig>;
  return {
    quick_provider: isValidProvider(parsed.quick_provider)
      ? parsed.quick_provider
      : DEFAULT_CONFIG.quick_provider,
    deep_provider: isValidProvider(parsed.deep_provider)
      ? parsed.deep_provider
      : DEFAULT_CONFIG.deep_provider,
  };
}

export function getAIConfig(): AIConfig {
  const now = Date.now();
  if (now < cacheExpiresAt) {
    return cachedConfig;
  }

  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    cachedConfig = parseAIConfig(raw);
  } catch {
    cachedConfig = DEFAULT_CONFIG;
  }

  cacheExpiresAt = now + CONFIG_CACHE_TTL_MS;
  return cachedConfig;
}

export function getProviderForMode(mode: AnalysisMode): AIProvider {
  const config = getAIConfig();
  return mode === "deep" ? config.deep_provider : config.quick_provider;
}
