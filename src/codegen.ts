/**
 * codegen.ts — Generate code skeletons from the journey graph.
 *
 * For each process node that has a files: field, generate a skeleton
 * implementation file. The agent fills in the actual implementation.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { CompiledIndex, CompiledNode } from './types.js';

export interface CodegenResult {
  generated: string[];
  skipped: string[];
}

/**
 * Generate code skeleton files for all process nodes that have files: field.
 */
export function generateCodeSkeletons(
  index: CompiledIndex,
  projectDir: string
): CodegenResult {
  const generated: string[] = [];
  const skipped: string[] = [];

  for (const [fullName, node] of Object.entries(index.nodes)) {
    if (node.type !== 'process') continue;
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
function generateSkeleton(fullName: string, node: CompiledNode, filePath: string): string {
  const name = fullName.split('/')[1];
  const ext = path.extname(filePath);

  if (ext === '.ts' || ext === '.js') {
    return generateTypeScriptSkeleton(name, node);
  }

  // Default: generic skeleton
  return `// ${fullName}\n// ${node.description}\n// TODO: implement\n`;
}

function generateTypeScriptSkeleton(name: string, node: CompiledNode): string {
  const lines: string[] = [];

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
  const actions = new Set<string>();
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

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1).replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Build a prompt for the LLM to fill a skeleton file with working implementation.
 * Returns the prompt string. Caller passes it to the LLM worker.
 */
export function buildFillPrompt(
  skeletonContent: string,
  fullNodeName: string,
  node: CompiledNode
): string {
  const lines: string[] = [];
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

export interface FillResult {
  filePath: string;
  success: boolean;
  error?: string;
}

/**
 * Validate that a generated/filled TypeScript file has valid syntax.
 * Runs tsc --noEmit on the file. Returns null if valid, error string if not.
 */
export function validateFilledSyntax(filePath: string, projectDir: string): string | null {
  const { execSync } = require('node:child_process') as typeof import('node:child_process');
  try {
    execSync(`npx tsc --noEmit "${filePath}"`, {
      cwd: projectDir,
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 30_000,
    });
    return null; // Valid
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string };
    return execErr.stdout || execErr.stderr || 'Unknown type check error';
  }
}

/**
 * Write a generated file to disk with retry on failure.
 * Returns true on success, throws with specific reason on failure.
 */
export function writeGeneratedFile(filePath: string, content: string, maxRetries = 2): void {
  const dir = path.dirname(filePath);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content);
      return;
    } catch (err: unknown) {
      const ioErr = err as NodeJS.ErrnoException;
      if (attempt === maxRetries) {
        throw new Error(`Failed to write ${filePath} after ${maxRetries + 1} attempts: ${ioErr.code ?? ioErr.message}`);
      }
      // Wait briefly before retry
    }
  }
}
