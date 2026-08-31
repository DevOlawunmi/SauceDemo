import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import type { Result } from 'axe-core';
 
/** WCAG rule tags scanned against. Keep in step with the team's target level. */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;
 
/** Impacts treated as build-breaking. Minor and moderate are reported, not gated. */
export const BLOCKING_IMPACTS = ['critical', 'serious'] as const;
 
/**
 * Rules already known to fail on Sauce Demo, excluded so the suite catches new
 * regressions rather than re-reporting the same accepted issues on every run.
 * Each entry needs a reason and, on a real project, a ticket reference.
 * Populate after the first run — see README.
 */
export const KNOWN_VIOLATIONS: readonly string[] = [
  'select-name', // Sauce Demo: product sort <select> has no label or aria-label (WCAG 4.1.2)
];
 
export async function scanForViolations(page: Page): Promise<Result[]> {
  const results = await new AxeBuilder({ page })
    .withTags([...WCAG_TAGS])
    .disableRules([...KNOWN_VIOLATIONS])
    .analyze();
 
  return results.violations.filter(
    (violation) =>
      violation.impact != null &&
      (BLOCKING_IMPACTS as readonly string[]).includes(violation.impact),
  );
}
 
/** Turns axe output into a failure message a developer can act on directly. */
export function formatViolations(violations: Result[]): string {
  if (violations.length === 0) {
    return 'No blocking accessibility violations found.';
  }
 
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(' '))
        .join(', ');
 
      return [
        `[${violation.impact}] ${violation.id} — ${violation.help}`,
        `  affected elements (${violation.nodes.length}): ${targets}`,
        `  how to fix: ${violation.helpUrl}`,
      ].join('\n');
    })
    .join('\n\n');
}
 