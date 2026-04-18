import type { DomainRule } from "./types";

export function isSiteEnabled(hostname: string, rules: DomainRule[]) {
  const enabledRules = rules.filter((rule) => rule.enabled);
  const blockMatch = enabledRules.find((rule) => rule.mode === "block" && hostname.includes(rule.pattern));

  if (blockMatch) {
    return false;
  }

  const allowRules = enabledRules.filter((rule) => rule.mode === "allow");
  if (allowRules.length === 0) {
    return true;
  }

  return allowRules.some((rule) => hostname.includes(rule.pattern));
}

