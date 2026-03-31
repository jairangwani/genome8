/**
 * testgen.ts — Generate test skeletons from journeys.
 *
 * Each journey step becomes a test case.
 * Engine generates the skeleton. Agent fills assertions.
 */
import fs from 'node:fs';
import path from 'node:path';
/**
 * Generate test files for all journeys.
 */
export function generateTests(index, testDir) {
    const generatedFiles = [];
    const journeyDir = path.join(testDir, 'journeys');
    if (!fs.existsSync(journeyDir)) {
        fs.mkdirSync(journeyDir, { recursive: true });
    }
    for (const [name, journey] of Object.entries(index.journeys)) {
        const testContent = generateJourneyTest(name, journey, index);
        const filePath = path.join(journeyDir, `${name}.test.ts`);
        fs.writeFileSync(filePath, testContent);
        generatedFiles.push(filePath);
    }
    return generatedFiles;
}
/**
 * Generate test content for a single journey.
 */
export function generateJourneyTest(name, journey, index) {
    const lines = [];
    lines.push(`// Auto-generated from journey: ${name}`);
    lines.push(`// Module: ${journey.module}`);
    if (journey.actor) {
        lines.push(`// Triggered by: ${journey.actor}`);
    }
    lines.push(`// Modules touched: ${journey.modules_touched.join(', ')}`);
    lines.push('');
    lines.push("import { describe, it, expect } from 'vitest';");
    lines.push('');
    // Add imports for nodes that have implementation files
    const imports = new Set();
    for (const step of journey.steps) {
        const node = index.nodes[step.node];
        if (node?.files?.length) {
            for (const file of node.files) {
                imports.add(`// Implementation: ${file}`);
            }
        }
    }
    if (imports.size > 0) {
        for (const imp of imports)
            lines.push(imp);
        lines.push('');
    }
    lines.push(`describe("${name}", () => {`);
    for (let i = 0; i < journey.steps.length; i++) {
        const step = journey.steps[i];
        const node = index.nodes[step.node];
        const nodeType = node ? ` (${node.type})` : '';
        const hasCode = node?.files?.length ? ` — has code: ${node.files[0]}` : '';
        lines.push(`  it("step ${step.step_number}: ${step.node} ${step.action}", () => {`);
        lines.push(`    // Node: ${step.node}${nodeType}${hasCode}`);
        lines.push(`    // Action: ${step.action}`);
        lines.push('    // TODO: agent fills assertion');
        lines.push('  });');
        lines.push('');
        // Connection assertion: consecutive step pair forms a connection
        if (i > 0) {
            const prev = journey.steps[i - 1];
            lines.push(`  it("connection: ${prev.node} → ${step.node}", () => {`);
            lines.push(`    // Assert that the output of step ${prev.step_number} feeds into step ${step.step_number}`);
            lines.push('    // TODO: agent fills connection assertion');
            lines.push('  });');
            lines.push('');
        }
    }
    lines.push('});');
    return lines.join('\n');
}
/**
 * Map import statements linking test files to codegen output.
 * Scans node files to generate appropriate import paths.
 */
export function mapTestImports(journey, index, testDir) {
    const imports = [];
    const seen = new Set();
    for (const step of journey.steps) {
        const node = index.nodes[step.node];
        if (!node?.files?.length)
            continue;
        for (const file of node.files) {
            if (seen.has(file))
                continue;
            seen.add(file);
            // Compute relative path from test file to implementation
            const testFilePath = path.join(testDir, 'journeys', `${journey.name}.test.ts`);
            const relPath = path.relative(path.dirname(testFilePath), file)
                .replace(/\\/g, '/') // normalize for Windows
                .replace(/\.ts$/, '.js');
            const moduleName = path.basename(file, path.extname(file));
            imports.push(`import { ${toPascalCase(moduleName)} } from '${relPath.startsWith('.') ? relPath : './' + relPath}';`);
        }
    }
    return imports;
}
function toPascalCase(str) {
    return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}
export function runTests(testDir) {
    const { execSync } = require('node:child_process');
    try {
        execSync(`npx vitest run --reporter=json "${testDir}"`, {
            encoding: 'utf-8',
            stdio: 'pipe',
            timeout: 120_000,
        });
        return { total: 0, passed: 0, failed: 0, failures: [] };
    }
    catch (err) {
        const execErr = err;
        const output = execErr.stdout || '';
        // Parse JSON reporter output
        try {
            const result = JSON.parse(output);
            const failures = [];
            for (const suite of result.testResults ?? []) {
                for (const test of suite.assertionResults ?? []) {
                    if (test.status === 'failed') {
                        failures.push({
                            file: suite.name,
                            test: test.fullName,
                            error: test.failureMessages?.join('\n') ?? 'Unknown error',
                        });
                    }
                }
            }
            return {
                total: result.numTotalTests ?? 0,
                passed: result.numPassedTests ?? 0,
                failed: result.numFailedTests ?? 0,
                failures,
            };
        }
        catch {
            return { total: 0, passed: 0, failed: 0, failures: [{ file: testDir, test: 'runner', error: output }] };
        }
    }
}
/**
 * Generate test content for a single journey (string only, no file write).
 * Useful for in-memory testing.
 */
export function generateJourneyTestString(name, journey, index) {
    return generateJourneyTest(name, journey, index);
}
//# sourceMappingURL=testgen.js.map