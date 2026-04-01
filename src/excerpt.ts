/**
 * excerpt.ts — Smart excerpt generation.
 * ~200 lines of focused context per module per turn.
 * Shows: your nodes, your journeys, what comes before/after,
 * cross-module connections, orphans, warnings.
 */

import type { CompiledIndex, CoverageReport, ValidationIssue } from './types.js';

export interface ExcerptInput {
  round: number;
  focusModule: string;
  index: CompiledIndex;
  coverage: CoverageReport;
  issues: ValidationIssue[];
  moduleFileContent: string;
  specSections?: string;
}

export function generateExcerpt(input: ExcerptInput): string {
  const { round, focusModule, index, coverage, issues, moduleFileContent, specSections } = input;
  const lines: string[] = [];
  const cov = coverage.modules[focusModule];

  lines.push(`ROUND ${round} — Focus: ${focusModule}`);
  lines.push('');

  // Module status
  lines.push('MODULE STATUS:');
  if (cov) {
    const byType = new Map<string, number>();
    for (const n of Object.values(index.nodes)) {
      if (n.module === focusModule) byType.set(n.type, (byType.get(n.type) ?? 0) + 1);
    }
    lines.push(`  ${cov.nodes} nodes (${[...byType.entries()].map(([t, c]) => `${c} ${t}`).join(', ')})`);
    lines.push(`  ${cov.journeys} journeys, ${cov.connections} connections, ${cov.cross_module_connections} cross-module`);
  } else {
    lines.push('  Module does not exist yet.');
  }
  lines.push('');

  // Your nodes
  const myNodes = Object.entries(index.nodes).filter(([, n]) => n.module === focusModule);
  if (myNodes.length > 0) {
    lines.push('YOUR NODES:');
    for (const [full, node] of myNodes) {
      lines.push(`  ${full.split('/')[1]} (${node.type}) — ${node.in_journeys.length} journeys, ${node.preceded_by.length + node.followed_by.length} connections`);
    }
    lines.push('');
  }

  // Your journeys (brief)
  const myJourneys = Object.values(index.journeys).filter(j => j.module === focusModule);
  if (myJourneys.length > 0) {
    lines.push('YOUR JOURNEYS:');
    for (const j of myJourneys) {
      const steps = j.steps.map(s => {
        const mod = s.node.split('/')[0];
        const name = s.node.split('/')[1];
        return mod === focusModule ? name : s.node;
      });
      const persona = j.actor ? j.actor.split('/')[1] : '?';
      lines.push(`  ${j.name}: ${persona} → ${steps.join(' → ')}`);
    }
    lines.push('');
  }

  // Cross-module connections
  const before = new Map<string, string[]>();
  const after = new Map<string, string[]>();
  for (const [full, node] of myNodes) {
    for (const p of node.preceded_by) {
      if (p.split('/')[0] !== focusModule) {
        if (!before.has(p)) before.set(p, []);
        before.get(p)!.push(full.split('/')[1]);
      }
    }
    for (const f of node.followed_by) {
      if (f.split('/')[0] !== focusModule) {
        if (!after.has(f)) after.set(f, []);
        after.get(f)!.push(full.split('/')[1]);
      }
    }
  }

  if (before.size > 0 || after.size > 0) {
    lines.push('CROSS-MODULE:');
    if (before.size > 0) {
      lines.push('  BEFORE YOU:');
      for (const [other, yours] of before) {
        const desc = index.nodes[other]?.description?.substring(0, 50) ?? '';
        lines.push(`    ${other} → ${yours.join(', ')} — ${desc}`);
      }
    }
    if (after.size > 0) {
      lines.push('  AFTER YOU:');
      for (const [other, yours] of after) {
        const desc = index.nodes[other]?.description?.substring(0, 50) ?? '';
        lines.push(`    ${yours.join(', ')} → ${other} — ${desc}`);
      }
    }
    lines.push('');
  }

  // Personas triggering journeys through this module
  const actors = new Set<string>();
  for (const [, n] of myNodes) {
    for (const p of n.triggered_by_actors) actors.add(p);
  }
  if (actors.size > 0) {
    lines.push('TRIGGERED BY: ' + [...actors].map(p => p.split('/')[1]).join(', '));
    lines.push('');
  }

  // Issues
  const myIssues = issues.filter(i => i.module === focusModule || i.module.includes(focusModule));
  if (myIssues.length > 0) {
    lines.push('ISSUES:');
    for (const i of myIssues) lines.push(`  ${i.severity === 'error' ? '❌' : '⚠️'} ${i.message}`);
    lines.push('');
  }

  // All modules overview
  lines.push('ALL MODULES:');
  for (const [mod, c] of Object.entries(coverage.modules)) {
    const me = mod === focusModule ? ' ← YOU' : '';
    lines.push(`  ${mod}: ${c.nodes} nodes, ${c.journeys} journeys, ${c.cross_module_connections} cross-mod${me}`);
  }
  lines.push('');

  // Global
  lines.push(`GLOBAL: ${index._stats.total_nodes} nodes, ${index._stats.total_journeys} journeys, ${index._stats.total_connections} connections`);
  lines.push(`  ${index._stats.orphans} orphans, ${index._stats.duplicate_names} dupes, ${index._stats.isolated_modules} isolated`);
  lines.push('');

  // Spec
  if (specSections) {
    lines.push('SPEC SECTIONS:');
    lines.push(specSections);
    lines.push('');
  }

  // Module file
  lines.push(`YOUR FILE (${focusModule}.yaml):`);
  lines.push('```yaml');
  lines.push(moduleFileContent);
  lines.push('```');

  // Truncate to ~200 line target
  return truncateToLimit(lines.join('\n'), 200);
}

/**
 * Truncate excerpt to approximately the target number of lines.
 * Prioritizes keeping structural sections (nodes, journeys, issues, cross-module)
 * and truncating the raw module file content last.
 */
function truncateToLimit(content: string, targetLines: number): string {
  const lines = content.split('\n');
  if (lines.length <= targetLines) return content;

  // Find the raw module file section and truncate it first
  const yamlStart = lines.findIndex(l => l === '```yaml');
  if (yamlStart !== -1 && yamlStart < targetLines) {
    const overhead = lines.length - targetLines;
    const yamlEnd = lines.lastIndexOf('```');
    const yamlLength = yamlEnd - yamlStart - 1;
    if (yamlLength > overhead) {
      // Truncate the YAML section
      const keepLines = yamlLength - overhead;
      const truncated = [
        ...lines.slice(0, yamlStart + 1),
        ...lines.slice(yamlStart + 1, yamlStart + 1 + keepLines),
        `# ... truncated ${overhead} lines ...`,
        ...lines.slice(yamlEnd),
      ];
      return truncated.join('\n');
    }
  }

  // Fallback: hard truncate with notice
  return [...lines.slice(0, targetLines - 1), `# ... truncated ${lines.length - targetLines + 1} lines ...`].join('\n');
}

/**
 * Collect all cross-module connections for a given module.
 * Returns inbound and outbound connections with their source/target context.
 * Standalone export for the CollectCrossModuleConnections node.
 */
export function collectCrossModuleConnections(
  focusModule: string,
  index: CompiledIndex
): { inbound: Array<{ from: string; to: string }>; outbound: Array<{ from: string; to: string }> } {
  const inbound: Array<{ from: string; to: string }> = [];
  const outbound: Array<{ from: string; to: string }> = [];

  for (const [full, node] of Object.entries(index.nodes)) {
    if (node.module !== focusModule) continue;
    for (const p of node.preceded_by) {
      if (p.split('/')[0] !== focusModule) {
        inbound.push({ from: p, to: full });
      }
    }
    for (const f of node.followed_by) {
      if (f.split('/')[0] !== focusModule) {
        outbound.push({ from: full, to: f });
      }
    }
  }

  return { inbound, outbound };
}

/**
 * Validate that all cross-module refs in an excerpt resolve to real nodes.
 * Returns unresolvable refs.
 * Standalone export for the ValidateCrossModuleRefIntegrity node.
 */
export function validateCrossModuleRefIntegrity(
  focusModule: string,
  index: CompiledIndex
): string[] {
  const unresolvable: string[] = [];
  for (const [, node] of Object.entries(index.nodes)) {
    if (node.module !== focusModule) continue;
    for (const ref of node.cross_module_connections) {
      if (!index.nodes[ref]) {
        unresolvable.push(ref);
      }
    }
  }
  return unresolvable;
}

/**
 * Validate that an excerpt contains all mandatory sections.
 * Returns names of missing sections.
 * Standalone export for the ValidateExcerptCompleteness node.
 */
export function validateExcerptCompleteness(excerpt: string): string[] {
  const required = ['MODULE STATUS:', 'ALL MODULES:', 'GLOBAL:'];
  const missing: string[] = [];
  for (const section of required) {
    if (!excerpt.includes(section)) {
      missing.push(section);
    }
  }
  return missing;
}

/**
 * Generate excerpts for multiple modules in a single pass.
 * Returns a map of module name → excerpt string.
 * Standalone export for the BatchGenerateExcerpts node.
 */
export function batchGenerateExcerpts(
  modules: string[],
  round: number,
  index: CompiledIndex,
  coverage: CoverageReport,
  issues: ValidationIssue[],
  moduleContents: Record<string, string>,
  specSections?: string
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const mod of modules) {
    result[mod] = generateExcerpt({
      round,
      focusModule: mod,
      index,
      coverage,
      issues,
      moduleFileContent: moduleContents[mod] ?? '',
      specSections,
    });
  }
  return result;
}
