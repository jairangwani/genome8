import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../src/compile.js';
import { generateCodeSkeletons } from '../src/codegen.js';
import type { ModuleFile } from '../src/types.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('codegen — skeleton generation from journey graph', () => {
  it('generates TypeScript skeleton for process nodes with files: field', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-codegen-'));

    const modules = new Map<string, ModuleFile>([
      ['_actors', { nodes: { User: { type: 'actor', description: 'A user' } } }],
      ['identity', {
        nodes: {
          KeyManager: {
            type: 'process',
            description: 'Generates Ed25519 keypairs for all entity types',
            properties: { algorithm: 'Ed25519', keySize: 256 },
            files: ['src/identity/KeyManager.ts'],
          },
          JWTService: {
            type: 'process',
            description: 'Issues JWT tokens',
            files: ['src/identity/JWTService.ts'],
          },
          KeyStore: {
            type: 'artifact',
            description: 'Encrypted keys',
            // No files field — should be skipped
          },
        },
        journeys: {
          Register: { steps: [
            { node: '_actors/User', action: 'signs up' },
            { node: 'KeyManager', action: 'generates keypair' },
            { node: 'JWTService', action: 'issues token' },
          ]},
          RotateKeys: { steps: [
            { node: '_actors/User', action: 'requests rotation' },
            { node: 'KeyManager', action: 'generates new key' },
          ]},
        },
      }],
    ]);

    const result = compileFromModules(modules);
    const codegen = generateCodeSkeletons(result.index, tmpDir);

    console.log(`Generated: ${codegen.generated.length} files`);
    console.log(`Skipped: ${codegen.skipped.length}`);
    codegen.generated.forEach(f => console.log(`  ✅ ${f}`));
    codegen.skipped.forEach(f => console.log(`  ⏭ ${f}`));

    // Should generate KeyManager.ts and JWTService.ts
    expect(codegen.generated).toContain('src/identity/KeyManager.ts');
    expect(codegen.generated).toContain('src/identity/JWTService.ts');

    // KeyStore is an artifact (not process) — codegen only handles process nodes
    // So KeyStore isn't even in the skipped list — it's simply not a candidate
    expect(codegen.generated.every(f => !f.includes('KeyStore'))).toBe(true);

    // Verify KeyManager.ts content
    const kmContent = fs.readFileSync(path.join(tmpDir, 'src/identity/KeyManager.ts'), 'utf-8');
    expect(kmContent).toContain('KeyManager');
    expect(kmContent).toContain('Ed25519');
    expect(kmContent).toContain('Register');
    expect(kmContent).toContain('RotateKeys');
    expect(kmContent).toContain('Preceded by');
    expect(kmContent).toContain('Followed by');

    console.log(`\nKeyManager.ts preview:\n${kmContent.substring(0, 400)}...`);

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('does not overwrite existing files', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-codegen-'));
    const existingFile = path.join(tmpDir, 'src/identity/KeyManager.ts');
    fs.mkdirSync(path.dirname(existingFile), { recursive: true });
    fs.writeFileSync(existingFile, '// existing code — do not overwrite');

    const modules = new Map<string, ModuleFile>([
      ['identity', {
        nodes: {
          KeyManager: {
            type: 'process',
            description: 'Keys',
            files: ['src/identity/KeyManager.ts'],
          },
        },
        journeys: { Test: { steps: [{ node: 'KeyManager', action: 'test' }] } },
      }],
    ]);

    const result = compileFromModules(modules);
    const codegen = generateCodeSkeletons(result.index, tmpDir);

    // Should skip existing file
    expect(codegen.skipped.some(s => s.includes('already exists'))).toBe(true);
    expect(codegen.generated.length).toBe(0);

    // File should still have original content
    const content = fs.readFileSync(existingFile, 'utf-8');
    expect(content).toBe('// existing code — do not overwrite');

    fs.rmSync(tmpDir, { recursive: true });
  });
});
