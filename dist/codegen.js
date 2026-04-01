/**
 * codegen.ts — Generate code skeletons from the journey graph.
 *
 * For each process node that has a files: field, generate a skeleton
 * implementation file. The agent fills in the actual implementation.
 */
import fs from 'node:fs';
import path from 'node:path';
/**
 * Generate code skeleton files for all process nodes that have files: field.
 */
export function generateCodeSkeletons(index, projectDir) {
    const generated = [];
    const skipped = [];
    for (const [fullName, node] of Object.entries(index.nodes)) {
        if (node.type !== 'process')
            continue;
        if (!node.files?.length) {
            skipped.push(`${fullName}: no files: field`);
            continue;
        }
        for (const filePath of node.files) {
            const absPath = path.join(projectDir, filePath);
            // Don't overwrite existing files
            if (fs.existsSync(absPath)) {
                skipped.push(`${filePath}: already exists`);
                continue;
            }
            // Ensure directory exists
            const dir = path.dirname(absPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Generate skeleton
            const content = generateSkeleton(fullName, node, filePath);
            fs.writeFileSync(absPath, content);
            generated.push(filePath);
        }
    }
    return { generated, skipped };
}
/**
 * Generate a skeleton file for a process node.
 */
function generateSkeleton(fullName, node, filePath) {
    const name = fullName.split('/')[1];
    const ext = path.extname(filePath);
    if (ext === '.ts' || ext === '.js') {
        return generateTypeScriptSkeleton(name, node);
    }
    // Default: generic skeleton
    return `// ${fullName}\n// ${node.description}\n// TODO: implement\n`;
}
function generateTypeScriptSkeleton(name, node) {
    const lines = [];
    lines.push(`/**`);
    lines.push(` * ${name}`);
    lines.push(` * ${node.description}`);
    lines.push(` *`);
    lines.push(` * Used in journeys:`);
    for (const j of node.in_journeys) {
        lines.push(` *   - ${j}`);
    }
    lines.push(` *`);
    lines.push(` * Preceded by: ${node.preceded_by.join(', ') || 'none'}`);
    lines.push(` * Followed by: ${node.followed_by.join(', ') || 'none'}`);
    if (node.triggered_by_actors.length) {
        lines.push(` * Triggered by: ${node.triggered_by_actors.join(', ')}`);
    }
    lines.push(` */`);
    lines.push('');
    // Properties as interface
    if (node.properties && Object.keys(node.properties).length > 0) {
        lines.push(`export interface ${name}Config {`);
        for (const [key, value] of Object.entries(node.properties)) {
            lines.push(`  ${key}: ${typeof value === 'string' ? 'string' : typeof value};`);
        }
        lines.push('}');
        lines.push('');
    }
    // Main class/function
    lines.push(`export class ${name} {`);
    lines.push(`  // TODO: implement based on journey descriptions above`);
    lines.push('');
    // Generate method stubs from journey steps
    const actions = new Set();
    for (const j of node.in_journeys) {
        // in_journeys format: "JourneyName (step N)"
        actions.add(j.split(' (')[0]);
    }
    for (const action of actions) {
        lines.push(`  /** Journey: ${action} */`);
        lines.push(`  async ${toCamelCase(action)}(): Promise<void> {`);
        lines.push(`    // TODO: implement`);
        lines.push(`    throw new Error('Not implemented');`);
        lines.push(`  }`);
        lines.push('');
    }
    lines.push('}');
    return lines.join('\n');
}
function toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1).replace(/[^a-zA-Z0-9]/g, '');
}
/**
 * Build a prompt for the LLM to fill a skeleton file with working implementation.
 * Returns the prompt string. Caller passes it to the LLM worker.
 */
export function buildFillPrompt(skeletonContent, fullNodeName, node) {
    const lines = [];
    lines.push(`Fill in the implementation for this TypeScript skeleton.`);
    lines.push(`Node: ${fullNodeName}`);
    lines.push(`Description: ${node.description}`);
    lines.push('');
    lines.push(`Context:`);
    lines.push(`- Preceded by: ${node.preceded_by.join(', ') || 'none'}`);
    lines.push(`- Followed by: ${node.followed_by.join(', ') || 'none'}`);
    if (node.triggered_by_actors.length) {
        lines.push(`- Triggered by: ${node.triggered_by_actors.join(', ')}`);
    }
    lines.push('');
    lines.push(`Rules:`);
    lines.push(`- Replace every \`throw new Error('Not implemented')\` with working code`);
    lines.push(`- Keep the class/function signatures exactly as they are`);
    lines.push(`- Add imports as needed at the top`);
    lines.push(`- Output ONLY the complete file content, no explanations`);
    lines.push('');
    lines.push(`Skeleton:`);
    lines.push('```typescript');
    lines.push(skeletonContent);
    lines.push('```');
    return lines.join('\n');
}
/**
 * Validate that a generated/filled TypeScript file has valid syntax.
 * Runs tsc --noEmit on the file. Returns null if valid, error string if not.
 */
export function validateFilledSyntax(filePath, projectDir) {
    const { execSync } = require('node:child_process');
    try {
        execSync(`npx tsc --noEmit "${filePath}"`, {
            cwd: projectDir,
            encoding: 'utf-8',
            stdio: 'pipe',
            timeout: 30_000,
        });
        return null; // Valid
    }
    catch (err) {
        const execErr = err;
        return execErr.stdout || execErr.stderr || 'Unknown type check error';
    }
}
/**
 * Write a generated file to disk with retry on failure.
 * Returns true on success, throws with specific reason on failure.
 */
export function writeGeneratedFile(filePath, content, maxRetries = 2) {
    const dir = path.dirname(filePath);
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(filePath, content);
            return;
        }
        catch (err) {
            const ioErr = err;
            if (attempt === maxRetries) {
                throw new Error(`Failed to write ${filePath} after ${maxRetries + 1} attempts: ${ioErr.code ?? ioErr.message}`);
            }
            // Wait briefly before retry
        }
    }
}
/**
 * Scan filled function bodies for placeholder patterns that indicate
 * the LLM did not produce real implementations.
 * Returns names of functions containing only placeholder code.
 * Enables RejectPlaceholderFill journey.
 */
export function detectPlaceholderFill(content) {
    const placeholders = [];
    const placeholderPatterns = [
        /throw\s+new\s+Error\s*\(\s*['"]Not implemented['"]\s*\)/,
        /throw\s+new\s+Error\s*\(\s*['"]TODO['"]\s*\)/,
        /return\s+undefined\s*;?\s*$/,
        /\/\/\s*TODO:\s*implement/,
    ];
    // Match function/method declarations and their bodies
    const funcMatches = content.matchAll(/(?:async\s+)?(?:function\s+(\w+)|(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*)\{([\s\S]*?)\n\s*\}/g);
    for (const match of funcMatches) {
        const name = match[1] || match[2];
        if (!name)
            continue;
        const body = match[3].trim();
        // Empty body
        if (!body) {
            placeholders.push(name);
            continue;
        }
        // Only placeholder patterns
        const lines = body.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
        const allPlaceholder = lines.length > 0 && lines.every(line => placeholderPatterns.some(p => p.test(line.trim())));
        if (allPlaceholder) {
            placeholders.push(name);
        }
    }
    return placeholders;
}
/**
 * Compare exported functions/classes in a filled file against the module's
 * node list to detect added or removed stubs that violate CodeComesFromNodes.
 * Returns {added, removed} stub names.
 * Enables RecoverFromNodeStubMismatch journey.
 */
export function detectNodeStubMismatch(content, expectedNodes) {
    // Extract exported class/function names from content
    const exportedNames = new Set();
    const exportMatches = content.matchAll(/export\s+(?:class|function|async\s+function)\s+(\w+)/g);
    for (const m of exportMatches) {
        exportedNames.add(m[1]);
    }
    const expectedSet = new Set(expectedNodes);
    const added = [...exportedNames].filter(n => !expectedSet.has(n));
    const removed = expectedNodes.filter(n => !exportedNames.has(n));
    return { added, removed };
}
/**
 * Compare the current graph node metadata against an existing source file
 * to determine if the code has drifted and needs a Mode 2 edit-based update.
 * Returns true if the file needs updating.
 * Enables UpdateExistingCodeFromGraph journey.
 */
export function detectCodeNeedsUpdate(existingContent, node) {
    // Check if the JSDoc description matches
    const descMatch = existingContent.match(/\*\s+(.+)\n\s+\*/);
    if (descMatch && descMatch[1] !== node.description) {
        return true;
    }
    // Check if journey participation changed
    for (const journey of node.in_journeys) {
        const journeyName = journey.split(' (')[0];
        if (!existingContent.includes(journeyName)) {
            return true;
        }
    }
    return false;
}
/**
 * Check that every module in the build list has a filled source file on disk.
 * Returns modules still missing their filled implementation file.
 * Standalone export for the ConfirmAllModulesFilled node.
 */
export function confirmAllModulesFilled(index, projectDir) {
    const missing = [];
    const checked = new Set();
    for (const [, node] of Object.entries(index.nodes)) {
        if (node.type !== 'process' || !node.files?.length)
            continue;
        if (checked.has(node.module))
            continue;
        checked.add(node.module);
        for (const filePath of node.files) {
            const absPath = path.join(projectDir, filePath);
            if (!fs.existsSync(absPath)) {
                missing.push(filePath);
            }
        }
    }
    return missing;
}
/**
 * On restart after a partial crash, scan the generated code directory
 * to find which modules already have filled files and return the next
 * unfilled module in alphabetical order.
 * Standalone export for the ResumeFromLastFilledModule node.
 */
export function resumeFromLastFilledModule(index, projectDir) {
    const modules = new Set();
    for (const [, node] of Object.entries(index.nodes)) {
        if (node.type === 'process' && node.files?.length) {
            modules.add(node.module);
        }
    }
    const sorted = [...modules].sort();
    for (const mod of sorted) {
        const moduleNodes = Object.entries(index.nodes)
            .filter(([, n]) => n.module === mod && n.type === 'process' && n.files?.length);
        for (const [, node] of moduleNodes) {
            for (const filePath of node.files) {
                if (!fs.existsSync(path.join(projectDir, filePath))) {
                    return mod; // This module still needs filling
                }
            }
        }
    }
    return null; // All modules filled
}
/**
 * Revert a filled file back to its skeleton state when the fill causes
 * downstream type errors.
 * Standalone export for the RollbackCorruptedFill node.
 */
export function rollbackCorruptedFill(filePath, fullNodeName, node) {
    const content = generateSkeleton(fullNodeName, node, filePath);
    fs.writeFileSync(filePath, content);
}
/**
 * Generate the diff between previous and current graph state for a node,
 * producing targeted edit instructions.
 * Standalone export for the GenerateUpdateContext node.
 */
export function generateUpdateContext(previousNode, currentNode) {
    const instructions = [];
    if (!previousNode) {
        instructions.push(`New node — generate complete implementation for: ${currentNode.description}`);
        return instructions;
    }
    if (previousNode.description !== currentNode.description) {
        instructions.push(`Description changed from "${previousNode.description}" to "${currentNode.description}"`);
    }
    const newJourneys = currentNode.in_journeys.filter(j => !previousNode.in_journeys.includes(j));
    if (newJourneys.length > 0) {
        instructions.push(`New journey participation: ${newJourneys.join(', ')}`);
    }
    const removedJourneys = previousNode.in_journeys.filter(j => !currentNode.in_journeys.includes(j));
    if (removedJourneys.length > 0) {
        instructions.push(`Removed from journeys: ${removedJourneys.join(', ')}`);
    }
    const newConnections = currentNode.followed_by.filter(c => !previousNode.followed_by.includes(c));
    if (newConnections.length > 0) {
        instructions.push(`New downstream connections: ${newConnections.join(', ')}`);
    }
    return instructions;
}
//# sourceMappingURL=codegen.js.map