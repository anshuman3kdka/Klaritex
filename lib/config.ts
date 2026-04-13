const enabledFlag = process.env.NEXT_PUBLIC_ENABLE_RESULTS_THREE_BG;

export const APP_CONFIG = {
  enableResultsThreeBackground: enabledFlag !== "false",
} as const;
