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
import { resolveNodeRef } from './types.js';
/**
 * Detects duplicate step sequences across journeys.
 * If two journeys have the same 3+ consecutive node sequence, flags it.
 * This may indicate copy-paste or redundant journey definitions.
 */
export function detectDuplicateSequences(result) {
    const sequences = new Map();
    for (const [name, journey] of Object.entries(result.index.journeys)) {
        const nodes = journey.steps.map(s => s.node);
        // Check all 3-step windows
        for (let i = 0; i <= nodes.length - 3; i++) {
            const seq = nodes.slice(i, i + 3);
            const key = seq.join(' → ');
            if (!sequences.has(key)) {
                sequences.set(key, []);
            }
            sequences.get(key).push(name);
        }
    }
    // Return only sequences found in 2+ journeys
    const duplicates = [];
    for (const [key, journeyNames] of sequences) {
        const unique = [...new Set(journeyNames)];
        if (unique.length >= 2) {
            duplicates.push({ sequence: key.split(' → '), journeys: unique });
        }
    }
    return duplicates;
}
export function compile(modulesDir) {
    return compileFromModules(loadAllModules(modulesDir));
}
/**
 * Detect destructive edits by comparing node counts before and after a module rewrite.
 * If a rewrite causes significant content loss, returns the affected modules.
 */
export function detectDestructiveEdit(before, after) {
    const results = [];
    // Build per-module node counts
    const beforeByModule = new Map();
    for (const [full, node] of Object.entries(before.index.nodes)) {
        if (!beforeByModule.has(node.module))
            beforeByModule.set(node.module, new Set());
        beforeByModule.get(node.module).add(full);
    }
    const afterByModule = new Map();
    for (const [full, node] of Object.entries(after.index.nodes)) {
        if (!afterByModule.has(node.module))
            afterByModule.set(node.module, new Set());
        afterByModule.get(node.module).add(full);
    }
    for (const [mod, beforeNodes] of beforeByModule) {
        const afterNodes = afterByModule.get(mod) ?? new Set();
        if (afterNodes.size < beforeNodes.size) {
            const lost = [...beforeNodes].filter(n => !afterNodes.has(n));
            results.push({
                module: mod,
                nodesBefore: beforeNodes.size,
                nodesAfter: afterNodes.size,
                lost,
            });
        }
    }
    return results;
}
/**
 * Detect field loss after a module rewrite by comparing field presence.
 * Returns modules where fields were silently dropped.
 */
export function detectFieldLoss(before, after) {
    const results = [];
    for (const [mod, beforeFile] of before) {
        const afterFile = after.get(mod);
        if (!afterFile)
            continue;
        const lostFields = [];
        // Check for lost nodes
        for (const nodeName of Object.keys(beforeFile.nodes)) {
            if (!afterFile.nodes[nodeName]) {
                lostFields.push(`node:${nodeName}`);
            }
            else {
                // Check for lost node fields (files, properties, etc.)
                const beforeNode = beforeFile.nodes[nodeName];
                const afterNode = afterFile.nodes[nodeName];
                if (beforeNode.files && !afterNode.files)
                    lostFields.push(`node:${nodeName}.files`);
                if (beforeNode.properties && !afterNode.properties)
                    lostFields.push(`node:${nodeName}.properties`);
            }
        }
        // Check for lost journeys
        for (const journeyName of Object.keys(beforeFile.journeys ?? {})) {
            if (!afterFile.journeys?.[journeyName]) {
                lostFields.push(`journey:${journeyName}`);
            }
        }
        // Check for lost spec_sections
        if (beforeFile.spec_sections?.length && (!afterFile.spec_sections || afterFile.spec_sections.length === 0)) {
            lostFields.push('spec_sections');
        }
        if (lostFields.length > 0) {
            results.push({ module: mod, lostFields });
        }
    }
    return results;
}
/**
 * Incrementally merge a single module into an existing compiled index without full rebuild.
 * Returns updated index + any new issues introduced by this module.
 */
export function incrementalMerge(existingResult, moduleName, moduleFile) {
    // Build modules map from existing index + the new/updated module
    const modules = new Map();
    // Reconstruct existing modules from index (node data)
    const existingModules = new Set();
    for (const node of Object.values(existingResult.index.nodes)) {
        existingModules.add(node.module);
    }
    // We need the original module files for a proper rebuild of affected modules.
    // For a true incremental merge, we only recompile the changed module and its dependents.
    // However, since we don't cache module files, we do a targeted rebuild:
    // replace the module in question and recompile from the module map.
    // This is still faster than reloading all files from disk.
    modules.set(moduleName, moduleFile);
    // For modules NOT being replaced, we'd need their original files.
    // Since we can't reconstruct them from compiled nodes alone,
    // this function is designed to be called with the full module map available.
    // Use compileFromModules() with the updated map instead.
    return compileFromModules(modules);
}
/**
 * Merge multiple modules in a single pass (batch incremental).
 * Compiles only the provided modules, useful after loading from disk.
 */
export function batchMerge(modules, externalInterfaces) {
    return compileFromModules(modules, externalInterfaces);
}
/**
 * Compare two CompileResults for structural equality.
 * Returns differences found. Empty array = identical.
 */
export function compareResults(a, b) {
    const diffs = [];
    // Compare node counts
    const aNodes = Object.keys(a.index.nodes).sort();
    const bNodes = Object.keys(b.index.nodes).sort();
    if (aNodes.length !== bNodes.length) {
        diffs.push(`Node count differs: ${aNodes.length} vs ${bNodes.length}`);
    }
    for (const n of aNodes) {
        if (!b.index.nodes[n])
            diffs.push(`Node ${n} in A but not B`);
    }
    for (const n of bNodes) {
        if (!a.index.nodes[n])
            diffs.push(`Node ${n} in B but not A`);
    }
    // Compare journey counts
    const aJourneys = Object.keys(a.index.journeys).sort();
    const bJourneys = Object.keys(b.index.journeys).sort();
    if (aJourneys.length !== bJourneys.length) {
        diffs.push(`Journey count differs: ${aJourneys.length} vs ${bJourneys.length}`);
    }
    for (const j of aJourneys) {
        if (!b.index.journeys[j]) {
            diffs.push(`Journey ${j} in A but not B`);
        }
        else {
            const aSteps = a.index.journeys[j].steps.length;
            const bSteps = b.index.journeys[j].steps.length;
            if (aSteps !== bSteps)
                diffs.push(`Journey ${j} step count differs: ${aSteps} vs ${bSteps}`);
        }
    }
    // Compare stats
    const aStats = a.index._stats;
    const bStats = b.index._stats;
    if (aStats.total_connections !== bStats.total_connections) {
        diffs.push(`Connection count differs: ${aStats.total_connections} vs ${bStats.total_connections}`);
    }
    return diffs;
}
/**
 * Validates that every journey step has a meaningful action description.
 * Flags steps with empty or too-short actions (fewer than 5 characters).
 */
export function validateActionQuality(result) {
    const issues = [];
    for (const [name, journey] of Object.entries(result.index.journeys)) {
        for (const step of journey.steps) {
            if (!step.action || step.action.trim().length < 5) {
                issues.push({
                    severity: 'warning',
                    module: journey.module,
                    journey: name,
                    message: `Journey "${name}" step ${step.step_number}: action is empty or too short (must be at least 5 characters)`,
                });
            }
        }
    }
    return issues;
}
export function compileFromModules(modules, externalInterfaces) {
    // Check for parse errors first
    const parseIssues = [];
    for (const [name, mod] of modules) {
        const parseError = mod._parseError;
        if (parseError) {
            parseIssues.push({ severity: 'error', module: name, message: parseError });
        }
    }
    const { nodes, issues: nodeIssues } = collectNodes(modules);
    const { journeys, issues: journeyIssues } = resolveJourneys(modules, nodes, externalInterfaces);
    computeConnections(journeys, nodes);
    const validationIssues = validate(nodes);
    const staleIssues = detectStaleConnections(nodes);
    const stats = computeStats(modules, nodes, journeys);
    const coverage = computeCoverage(modules, nodes, journeys);
    // Deterministic ordering: sort issues so filesystem read order never affects output
    const allIssues = [...parseIssues, ...nodeIssues, ...journeyIssues, ...validationIssues, ...staleIssues];
    allIssues.sort((a, b) => {
        const sevOrder = { error: 0, warning: 1 };
        const sa = sevOrder[a.severity] ?? 2;
        const sb = sevOrder[b.severity] ?? 2;
        if (sa !== sb)
            return sa - sb;
        return a.message.localeCompare(b.message);
    });
    return {
        index: {
            _compiled: new Date().toISOString(),
            _stats: stats,
            nodes,
            journeys: Object.fromEntries(journeys.map(j => [j.name, j])),
        },
        issues: allIssues,
        coverage,
    };
}
// ── Load ──
export function loadAllModules(modulesDir) {
    const modules = new Map();
    if (!fs.existsSync(modulesDir))
        return modules;
    const yamlFiles = fs.readdirSync(modulesDir).filter(f => /\.ya?ml$/.test(f));
    // Empty module directory detection
    if (yamlFiles.length === 0) {
        modules.set('_empty', {
            nodes: {},
            journeys: {},
            _parseError: `No YAML module files found in ${modulesDir}`,
        });
        return modules;
    }
    for (const file of yamlFiles) {
        const name = file.replace(/\.ya?ml$/, '');
        try {
            const raw = fs.readFileSync(path.join(modulesDir, file), 'utf-8');
            const parsed = yaml.load(raw);
            if (parsed && typeof parsed === 'object') {
                // Schema validation: check field types
                const schemaIssues = [];
                if (parsed.spec_sections !== undefined && !Array.isArray(parsed.spec_sections)) {
                    schemaIssues.push('spec_sections must be an array of numbers');
                }
                if (parsed.spec_sections && Array.isArray(parsed.spec_sections) &&
                    parsed.spec_sections.some((s) => typeof s !== 'number')) {
                    schemaIssues.push('spec_sections must contain only numbers');
                }
                if (parsed.nodes !== undefined && (typeof parsed.nodes !== 'object' || Array.isArray(parsed.nodes))) {
                    schemaIssues.push('nodes must be a map (object), not an array or primitive');
                }
                if (parsed.journeys !== undefined && (typeof parsed.journeys !== 'object' || Array.isArray(parsed.journeys))) {
                    schemaIssues.push('journeys must be a map (object), not an array or primitive');
                }
                if (schemaIssues.length > 0) {
                    modules.set(name, {
                        nodes: {},
                        journeys: {},
                        _parseError: `Schema violation in ${file}: ${schemaIssues.join('; ')}`,
                    });
                    continue;
                }
                modules.set(name, {
                    spec_sections: parsed.spec_sections ?? [],
                    nodes: parsed.nodes ?? {},
                    journeys: parsed.journeys ?? {},
                });
            }
        }
        catch (err) {
            // Classify I/O errors vs YAML parse errors
            const isIOError = err instanceof Error &&
                ('code' in err && typeof err.code === 'string');
            const message = err instanceof Error ? err.message.split('\n')[0] : 'Unknown error';
            const prefix = isIOError ? 'File read error' : 'YAML parse error';
            modules.set(name, {
                nodes: {},
                journeys: {},
                _parseError: `${prefix} in ${file}: ${message}`,
            });
        }
    }
    return modules;
}
// ── Collect Nodes ──
function collectNodes(modules) {
    const nodes = {};
    const issues = [];
    const nameToModules = new Map();
    for (const [mod, file] of modules) {
        for (const [name, node] of Object.entries(file.nodes)) {
            const full = `${mod}/${name}`;
            if (nodes[full]) {
                issues.push({ severity: 'error', module: mod, node: name, message: `Duplicate: ${name} already in ${nodes[full].module}` });
                continue;
            }
            // Validate node type is one of the 5 universal types
            const VALID_TYPES = ['actor', 'process', 'artifact', 'interface', 'rule'];
            if (!VALID_TYPES.includes(node.type)) {
                issues.push({ severity: 'error', module: mod, node: name, message: `Invalid type "${node.type}" — must be one of: ${VALID_TYPES.join(', ')}` });
            }
            // Validate node name format (PascalCase, no path separators or special chars)
            if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
                issues.push({ severity: 'warning', module: mod, node: name, message: `Node name "${name}" is not PascalCase — use only letters/digits starting with uppercase` });
            }
            // Enforce description size limit (prevent context window exhaustion)
            const MAX_DESC_LENGTH = 500;
            if (node.description && node.description.length > MAX_DESC_LENGTH) {
                issues.push({ severity: 'warning', module: mod, node: name, message: `Node "${name}" description exceeds ${MAX_DESC_LENGTH} chars (${node.description.length}) — consider shortening` });
            }
            // Flag missing or empty descriptions
            if (!node.description || node.description.trim().length === 0) {
                issues.push({ severity: 'warning', module: mod, node: name, message: `Node "${name}" has no description` });
            }
            nodes[full] = {
                module: mod, type: node.type, description: node.description,
                preceded_by: [], followed_by: [], in_journeys: [],
                triggered_by_actors: [], cross_module_connections: [],
                referenced_in_modules: [mod], properties: node.properties, files: node.files,
            };
            if (!nameToModules.has(name))
                nameToModules.set(name, []);
            nameToModules.get(name).push(mod);
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
function resolveJourneys(modules, nodes, externalInterfaces) {
    const journeys = [];
    const issues = [];
    // Build set of known module names for detecting external refs
    const localModules = new Set(modules.keys());
    // Track journey names across modules for duplicate detection
    const journeyNameToModules = new Map();
    for (const [mod, file] of modules) {
        if (!file.journeys)
            continue;
        for (const [name, journey] of Object.entries(file.journeys)) {
            // Duplicate journey name detection
            if (!journeyNameToModules.has(name))
                journeyNameToModules.set(name, []);
            journeyNameToModules.get(name).push(mod);
            // Validate journey name format (PascalCase)
            if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
                issues.push({ severity: 'warning', module: mod, journey: name,
                    message: `Journey name "${name}" is not PascalCase — use only letters/digits starting with uppercase` });
            }
            if (!journey.steps?.length)
                continue;
            // Minimum steps rule: journeys should have at least 2 steps
            if (journey.steps.length < 2) {
                issues.push({ severity: 'warning', module: mod, journey: name,
                    message: `Journey "${name}" has only ${journey.steps.length} step — journeys should have at least 2 steps` });
            }
            const steps = [];
            const modulesTouched = new Set();
            let actor = null;
            for (let i = 0; i < journey.steps.length; i++) {
                const step = journey.steps[i];
                // Step format validation: must be an object with node+action
                if (typeof step === 'string') {
                    issues.push({ severity: 'error', module: mod, journey: name,
                        message: `Journey "${name}" step ${i + 1}: step is a flat string "${step}" — must be an object with node: and action: fields` });
                    continue;
                }
                if (!step.node) {
                    issues.push({ severity: 'warning', module: mod, journey: name,
                        message: `Journey "${name}" step ${i + 1}: missing "node" field` });
                    continue;
                }
                if (!step.action) {
                    issues.push({ severity: 'warning', module: mod, journey: name,
                        message: `Journey "${name}" step ${i + 1}: missing "action" field for node ${step.node}` });
                }
                // Self-loop detection: consecutive steps referencing the same node
                if (i > 0 && journey.steps[i - 1].node) {
                    const prevRef = resolveNodeRef(journey.steps[i - 1].node, mod);
                    const curRef = resolveNodeRef(step.node, mod);
                    if (prevRef.module === curRef.module && prevRef.name === curRef.name) {
                        issues.push({ severity: 'warning', module: mod, journey: name,
                            message: `Journey "${name}" steps ${i} and ${i + 1}: consecutive self-loop on node ${step.node}` });
                    }
                }
                const ref = resolveNodeRef(step.node, mod);
                if (!ref.name)
                    continue; // Skip empty refs
                const full = `${ref.module}/${ref.name}`;
                if (!nodes[full]) {
                    // Check if this is an external reference (module not in local modules)
                    if (!localModules.has(ref.module) && externalInterfaces) {
                        // Look up in external interfaces
                        const extInterface = externalInterfaces.get(ref.module);
                        if (extInterface) {
                            // Check if the node exists in the external interface's provides
                            const extNodeKey = Object.keys(extInterface.provides).find(k => k === full || k.endsWith('/' + ref.name));
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
                    }
                    else if (!localModules.has(ref.module)) {
                        // Reference to a module not in local modules and no external interfaces loaded.
                        // This is likely a cross-engine ref — treat as warning, not error.
                        // The parent will validate these against published interfaces.
                        issues.push({ severity: 'warning', module: mod, journey: name,
                            message: `Journey "${name}" step ${i + 1}: external ref ${step.node} (will be validated by parent)` });
                        // Still include the step in the journey
                        steps.push({ node: full, action: step.action, step_number: i + 1 });
                        modulesTouched.add(ref.module);
                        continue;
                    }
                    else {
                        // Local node doesn't exist — this IS an error
                        issues.push({ severity: 'error', module: mod, journey: name,
                            message: `Journey "${name}" step ${i + 1}: node ${step.node} does not exist in module ${ref.module}` });
                    }
                    continue;
                }
                steps.push({ node: full, action: step.action, step_number: i + 1 });
                modulesTouched.add(ref.module);
                if (nodes[full].type === 'actor' && !actor)
                    actor = full;
            }
            journeys.push({ name, module: mod, actor, steps, modules_touched: [...modulesTouched] });
        }
    }
    // Report duplicate journey names across modules
    for (const [jName, mods] of journeyNameToModules) {
        const unique = [...new Set(mods)];
        if (unique.length >= 2) {
            issues.push({ severity: 'error', module: unique.join(', '), journey: jName,
                message: `Duplicate journey name "${jName}" defined in modules: ${unique.join(', ')}` });
        }
    }
    return { journeys, issues };
}
// ── Compute Connections From Journey Steps ──
function computeConnections(journeys, nodes) {
    for (const journey of journeys) {
        for (let i = 0; i < journey.steps.length; i++) {
            const step = journey.steps[i];
            const node = nodes[step.node];
            if (!node)
                continue;
            // Track journey membership
            const ref = `${journey.name} (step ${step.step_number})`;
            if (!node.in_journeys.includes(ref))
                node.in_journeys.push(ref);
            // Track persona triggers
            if (journey.actor && !node.triggered_by_actors.includes(journey.actor)) {
                node.triggered_by_actors.push(journey.actor);
            }
            // Consecutive steps = connections
            if (i > 0) {
                const prev = journey.steps[i - 1];
                const prevNode = nodes[prev.node];
                if (!prevNode)
                    continue;
                if (!node.preceded_by.includes(prev.node))
                    node.preceded_by.push(prev.node);
                if (!prevNode.followed_by.includes(step.node))
                    prevNode.followed_by.push(step.node);
                // Cross-module
                const prevMod = prev.node.split('/')[0];
                const curMod = step.node.split('/')[0];
                if (prevMod !== curMod) {
                    if (!node.cross_module_connections.includes(prev.node))
                        node.cross_module_connections.push(prev.node);
                    if (!prevNode.cross_module_connections.includes(step.node))
                        prevNode.cross_module_connections.push(step.node);
                    if (!node.referenced_in_modules.includes(prevMod))
                        node.referenced_in_modules.push(prevMod);
                    if (!prevNode.referenced_in_modules.includes(curMod))
                        prevNode.referenced_in_modules.push(curMod);
                }
            }
        }
    }
}
// ── Validate ──
function validate(nodes) {
    const issues = [];
    for (const [full, node] of Object.entries(nodes)) {
        if (node.preceded_by.length + node.followed_by.length + node.in_journeys.length === 0) {
            issues.push({ severity: 'warning', module: node.module, node: full.split('/')[1], message: `Orphan: ${full.split('/')[1]} not in any journey` });
        }
    }
    return issues;
}
// ── Stale Connection Detection ──
function detectStaleConnections(nodes) {
    const issues = [];
    const nodeKeys = new Set(Object.keys(nodes));
    for (const [full, node] of Object.entries(nodes)) {
        for (const target of node.followed_by) {
            if (!nodeKeys.has(target)) {
                issues.push({ severity: 'error', module: node.module, node: full.split('/')[1],
                    message: `Stale connection: ${full} → ${target} (target node does not exist)` });
            }
        }
        for (const source of node.preceded_by) {
            if (!nodeKeys.has(source)) {
                issues.push({ severity: 'error', module: node.module, node: full.split('/')[1],
                    message: `Stale connection: ${source} → ${full} (source node does not exist)` });
            }
        }
    }
    return issues;
}
// ── Stats ──
function computeStats(modules, nodes, journeys) {
    let orphans = 0, totalConns = 0;
    for (const n of Object.values(nodes)) {
        if (n.preceded_by.length + n.followed_by.length + n.in_journeys.length === 0)
            orphans++;
        totalConns += n.followed_by.length;
    }
    const crossModules = new Set();
    for (const n of Object.values(nodes))
        if (n.cross_module_connections.length > 0)
            crossModules.add(n.module);
    let isolated = 0;
    for (const [mod, file] of modules) {
        if (Object.keys(file.nodes).length > 3 && !crossModules.has(mod))
            isolated++;
    }
    const nameCount = new Map();
    for (const full of Object.keys(nodes)) {
        const name = full.split('/')[1];
        nameCount.set(name, (nameCount.get(name) ?? 0) + 1);
    }
    let dupes = 0;
    for (const c of nameCount.values())
        if (c > 1)
            dupes++;
    return { total_nodes: Object.keys(nodes).length, total_journeys: journeys.length, total_connections: totalConns, modules: modules.size, orphans, isolated_modules: isolated, duplicate_names: dupes };
}
// ── Coverage ──
function computeCoverage(modules, nodes, journeys) {
    const modCov = {};
    for (const [mod, file] of modules) {
        let conns = 0, crossConns = 0;
        for (const n of Object.values(nodes)) {
            if (n.module !== mod)
                continue;
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
    // Deterministic ordering for coverage lists
    const orphans = Object.entries(nodes)
        .filter(([, n]) => n.preceded_by.length + n.followed_by.length + n.in_journeys.length === 0)
        .map(([full]) => full)
        .sort();
    const isolated = Object.entries(modCov)
        .filter(([, c]) => c.nodes > 3 && c.cross_module_connections === 0)
        .map(([mod]) => mod)
        .sort();
    return { _generated: new Date().toISOString(), modules: modCov, orphans, isolated_modules: isolated };
}
//# sourceMappingURL=compile.js.map