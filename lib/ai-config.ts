import fs from "fs";
import path from "path";
import type { AnalysisMode } from "@/lib/types";

export type AIProvider = "gemini" | "groq";

interface AIConfig {
  quick_provider: AIProvider;
  deep_provider: AIProvider;
}

const CONFIG_PATH = path.join(process.cwd(), "content/settings/api-config.json");

const DEFAULT_CONFIG: AIConfig = {
  quick_provider: "groq",
  deep_provider: "groq",
};

function isValidProvider(v: unknown): v is AIProvider {
  return v === "gemini" || v === "groq";
}

export function getAIConfig(): AIConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<AIConfig>;
    return {
      quick_provider: isValidProvider(parsed.quick_provider)
        ? parsed.quick_provider
        : DEFAULT_CONFIG.quick_provider,
      deep_provider: isValidProvider(parsed.deep_provider)
        ? parsed.deep_provider
        : DEFAULT_CONFIG.deep_provider,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function getProviderForMode(mode: AnalysisMode): AIProvider {
  const config = getAIConfig();
  return mode === "deep" ? config.deep_provider : config.quick_provider;
}
