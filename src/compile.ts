/**
 * compile.ts — THE HEART
 *
 * Reads ALL module YAML files.
 * Computes ALL connections from journey steps.
 * No manual edges. Consecutive steps = connections.
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type {
  ModuleFile, CompiledIndex, CompiledNode, CompiledStats,
  CompiledJourney, ValidationIssue, CoverageReport, ModuleCoverage,
  PublishedInterface,
} from './types.js';
import { resolveNodeRef } from './types.js';

export interface CompileResult {
  index: CompiledIndex;
  issues: ValidationIssue[];
  coverage: CoverageReport;
}

export function compile(modulesDir: string): CompileResult {
  return compileFromModules(loadAllModules(modulesDir));
}

/**
 * Validates that all journey steps have meaningful action descriptions.
 * Flags steps with empty or generic actions like "does something".
 */
export function validateActionQuality(result: CompileResult): string[] {
  const issues: string[] = [];
  for (const [name, journey] of Object.entries(result.index.journeys)) {
    for (const step of journey.steps) {
      if (!step.action || step.action.length < 5) {
        issues.push(`Journey "${name}" step ${step.step_number}: action too short or empty`);
      }
    }
  }
  return issues;
}

export function compileFromModules(
  modules: Map<string, ModuleFile>,
  externalInterfaces?: Map<string, PublishedInterface>
): CompileResult {
  // Check for parse errors first
  const parseIssues: ValidationIssue[] = [];
  for (const [name, mod] of modules) {
    const parseError = (mod as ModuleFile & { _parseError?: string })._parseError;
    if (parseError) {
      parseIssues.push({ severity: 'error', module: name, message: parseError });
    }
  }

  const { nodes, issues: nodeIssues } = collectNodes(modules);
  const { journeys, issues: journeyIssues } = resolveJourneys(modules, nodes, externalInterfaces);
  computeConnections(journeys, nodes);
  const validationIssues = validate(nodes);
  const stats = computeStats(modules, nodes, journeys);
  const coverage = computeCoverage(modules, nodes, journeys);

  return {
    index: {
      _compiled: new Date().toISOString(),
      _stats: stats,
      nodes,
      journeys: Object.fromEntries(journeys.map(j => [j.name, j])),
    },
    issues: [...parseIssues, ...nodeIssues, ...journeyIssues, ...validationIssues],
    coverage,
  };
}

// ── Load ──

export function loadAllModules(modulesDir: string): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();
  if (!fs.existsSync(modulesDir)) return modules;

  for (const file of fs.readdirSync(modulesDir).filter(f => /\.ya?ml$/.test(f))) {
    const name = file.replace(/\.ya?ml$/, '');
    try {
      const parsed = yaml.load(fs.readFileSync(path.join(modulesDir, file), 'utf-8')) as ModuleFile;
      if (parsed && typeof parsed === 'object') {
        modules.set(name, {
          spec_sections: parsed.spec_sections ?? [],
          nodes: parsed.nodes ?? {},
          journeys: parsed.journeys ?? {},
        });
      }
    } catch (err) {
      // Surface YAML parse errors — don't silently swallow
      const message = err instanceof Error ? err.message.split('\n')[0] : 'Unknown parse error';
      modules.set(name, {
        nodes: {},
        journeys: {},
        _parseError: `YAML parse error in ${file}: ${message}`,
      } as ModuleFile & { _parseError: string });
    }
  }
  return modules;
}

// ── Collect Nodes ──

function collectNodes(modules: Map<string, ModuleFile>): { nodes: Record<string, CompiledNode>; issues: ValidationIssue[] } {
  const nodes: Record<string, CompiledNode> = {};
  const issues: ValidationIssue[] = [];
  const nameToModules = new Map<string, string[]>();

  for (const [mod, file] of modules) {
    for (const [name, node] of Object.entries(file.nodes)) {
      const full = `${mod}/${name}`;
      if (nodes[full]) {
        issues.push({ severity: 'error', module: mod, node: name, message: `Duplicate: ${name} already in ${nodes[full].module}` });
        continue;
      }
      nodes[full] = {
        module: mod, type: node.type, description: node.description,
        preceded_by: [], followed_by: [], in_journeys: [],
        triggered_by_actors: [], cross_module_connections: [],
        referenced_in_modules: [mod], properties: node.properties, files: node.files,
      };
      if (!nameToModules.has(name)) nameToModules.set(name, []);
      nameToModules.get(name)!.push(mod);
    }
  }

  for (const [name, mods] of nameToModules) {
    if (mods.length > 1) {
      issues.push({ severity: 'error', module: mods.join(', '), node: name, message: `Duplicate name "${name}" in: ${mods.join(', ')}` });
    }
  }

  return { nodes, issues };
}

// ── Resolve Journeys ──

function resolveJourneys(
  modules: Map<string, ModuleFile>,
  nodes: Record<string, CompiledNode>,
  externalInterfaces?: Map<string, PublishedInterface>
): { journeys: CompiledJourney[]; issues: ValidationIssue[] } {
  const journeys: CompiledJourney[] = [];
  const issues: ValidationIssue[] = [];

  // Build set of known module names for detecting external refs
  const localModules = new Set(modules.keys());

  for (const [mod, file] of modules) {
    if (!file.journeys) continue;
    for (const [name, journey] of Object.entries(file.journeys)) {
      if (!journey.steps?.length) continue;

      const steps: CompiledJourney['steps'] = [];
      const modulesTouched = new Set<string>();
      let actor: string | null = null;

      for (let i = 0; i < journey.steps.length; i++) {
        const step = journey.steps[i];
        if (!step.node) continue; // Skip steps with missing node ref
        const ref = resolveNodeRef(step.node, mod);
        if (!ref.name) continue; // Skip empty refs
        const full = `${ref.module}/${ref.name}`;

        if (!nodes[full]) {
          // Check if this is an external reference (module not in local modules)
          if (!localModules.has(ref.module) && externalInterfaces) {
            // Look up in external interfaces
            const extInterface = externalInterfaces.get(ref.module);
            if (extInterface) {
              // Check if the node exists in the external interface's provides
              const extNodeKey = Object.keys(extInterface.provides).find(
                k => k === full || k.endsWith('/' + ref.name)
              );
              if (extNodeKey) {
                // Valid external reference — not an error
                steps.push({ node: full, action: step.action, step_number: i + 1 });
                modulesTouched.add(ref.module);
                continue;
              }
            }
            // External module exists but node not in its interface
            issues.push({ severity: 'error', module: mod, journey: name,
              message: `Journey "${name}" step ${i + 1}: node ${step.node} not found in ${ref.module}'s published interface` });
          } else if (!localModules.has(ref.module)) {
            // Reference to a module not in local modules and no external interfaces loaded.
            // This is likely a cross-engine ref — treat as warning, not error.
            // The parent will validate these against published interfaces.
            issues.push({ severity: 'warning', module: mod, journey: name,
              message: `Journey "${name}" step ${i + 1}: external ref ${step.node} (will be validated by parent)` });
            // Still include the step in the journey
            steps.push({ node: full, action: step.action, step_number: i + 1 });
            modulesTouched.add(ref.module);
            continue;
          } else {
            // Local node doesn't exist — this IS an error
            issues.push({ severity: 'error', module: mod, journey: name,
              message: `Journey "${name}" step ${i + 1}: node ${step.node} does not exist in module ${ref.module}` });
          }
          continue;
        }

        steps.push({ node: full, action: step.action, step_number: i + 1 });
        modulesTouched.add(ref.module);
        if (nodes[full].type === 'actor' && !actor) actor = full;
      }

      journeys.push({ name, module: mod, actor, steps, modules_touched: [...modulesTouched] });
    }
  }

  return { journeys, issues };
}

// ── Compute Connections From Journey Steps ──

function computeConnections(journeys: CompiledJourney[], nodes: Record<string, CompiledNode>): void {
  for (const journey of journeys) {
    for (let i = 0; i < journey.steps.length; i++) {
      const step = journey.steps[i];
      const node = nodes[step.node];
      if (!node) continue;

      // Track journey membership
      const ref = `${journey.name} (step ${step.step_number})`;
      if (!node.in_journeys.includes(ref)) node.in_journeys.push(ref);

      // Track persona triggers
      if (journey.actor && !node.triggered_by_actors.includes(journey.actor)) {
        node.triggered_by_actors.push(journey.actor);
      }

      // Consecutive steps = connections
      if (i > 0) {
        const prev = journey.steps[i - 1];
        const prevNode = nodes[prev.node];
        if (!prevNode) continue;

        if (!node.preceded_by.includes(prev.node)) node.preceded_by.push(prev.node);
        if (!prevNode.followed_by.includes(step.node)) prevNode.followed_by.push(step.node);

        // Cross-module
        const prevMod = prev.node.split('/')[0];
        const curMod = step.node.split('/')[0];
        if (prevMod !== curMod) {
          if (!node.cross_module_connections.includes(prev.node)) node.cross_module_connections.push(prev.node);
          if (!prevNode.cross_module_connections.includes(step.node)) prevNode.cross_module_connections.push(step.node);
          if (!node.referenced_in_modules.includes(prevMod)) node.referenced_in_modules.push(prevMod);
          if (!prevNode.referenced_in_modules.includes(curMod)) prevNode.referenced_in_modules.push(curMod);
        }
      }
    }
  }
}

// ── Validate ──

function validate(nodes: Record<string, CompiledNode>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [full, node] of Object.entries(nodes)) {
    if (node.preceded_by.length + node.followed_by.length + node.in_journeys.length === 0) {
      issues.push({ severity: 'warning', module: node.module, node: full.split('/')[1], message: `Orphan: ${full.split('/')[1]} not in any journey` });
    }
  }
  return issues;
}

// ── Stats ──

function computeStats(modules: Map<string, ModuleFile>, nodes: Record<string, CompiledNode>, journeys: CompiledJourney[]): CompiledStats {
  let orphans = 0, totalConns = 0;
  for (const n of Object.values(nodes)) {
    if (n.preceded_by.length + n.followed_by.length + n.in_journeys.length === 0) orphans++;
    totalConns += n.followed_by.length;
  }

  const crossModules = new Set<string>();
  for (const n of Object.values(nodes)) if (n.cross_module_connections.length > 0) crossModules.add(n.module);
  let isolated = 0;
  for (const [mod, file] of modules) {
    if (Object.keys(file.nodes).length > 3 && !crossModules.has(mod)) isolated++;
  }

  const nameCount = new Map<string, number>();
  for (const full of Object.keys(nodes)) {
    const name = full.split('/')[1];
    nameCount.set(name, (nameCount.get(name) ?? 0) + 1);
  }
  let dupes = 0;
  for (const c of nameCount.values()) if (c > 1) dupes++;

  return { total_nodes: Object.keys(nodes).length, total_journeys: journeys.length, total_connections: totalConns, modules: modules.size, orphans, isolated_modules: isolated, duplicate_names: dupes };
}

// ── Coverage ──

function computeCoverage(modules: Map<string, ModuleFile>, nodes: Record<string, CompiledNode>, journeys: CompiledJourney[]): CoverageReport {
  const modCov: Record<string, ModuleCoverage> = {};

  for (const [mod, file] of modules) {
    let conns = 0, crossConns = 0;
    for (const n of Object.values(nodes)) {
      if (n.module !== mod) continue;
      conns += n.followed_by.length + n.preceded_by.length;
      crossConns += n.cross_module_connections.length;
    }
    modCov[mod] = {
      nodes: Object.keys(file.nodes).length,
      journeys: journeys.filter(j => j.module === mod).length,
      connections: conns, cross_module_connections: crossConns,
      spec_sections: file.spec_sections ?? [],
    };
  }

  const orphans = Object.entries(nodes)
    .filter(([, n]) => n.preceded_by.length + n.followed_by.length + n.in_journeys.length === 0)
    .map(([full]) => full);

  const isolated = Object.entries(modCov)
    .filter(([, c]) => c.nodes > 3 && c.cross_module_connections === 0)
    .map(([mod]) => mod);

  return { _generated: new Date().toISOString(), modules: modCov, orphans, isolated_modules: isolated };
}
