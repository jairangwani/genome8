# ORGANIZATION

## SCOPE

Genome8 is a protocol that breaks complex systems into scoped YAML modules, maps how pieces connect through journeys, and keeps everything in sync via event-driven ripple — replacing all documentation with a single living context graph where the only human input is spec.md.

## MODULES

- `graph` — core data model: the 5 node types (actor, process, artifact, interface, rule), journeys, connections, published interfaces
- `compilation` — YAML module parsing, connection computation, validation (duplicates, dangling refs, orphans, isolated modules)
- `convergence` — the orchestrator pipeline: organization → actors → hierarchy decision → module creation → compile check → audit → publish → codegen → sleep/wake
- `llm` — LLMWorker class, persistent Claude Code process management, stream-json protocol, native tool usage (Read, Write, Edit, Bash)
- `excerpt` — per-module context generation (~200 lines), cross-module connections, actor summaries, warnings
- `publish` — interface.yaml and changelog.yaml generation, SHA256 hash computation, event file writing
- `sync` — dependency hash checking, stale module detection, targeted reconvergence marking
- `events` — event-driven sleep/wake, fs.watch monitoring, zero-cost-at-rest, ripple propagation across boxes
- `hierarchy` — parent/child splitting, scoped spec + shared actor distribution, child engine spawning, cross-engine journey creation, external ref validation
- `organization` — spec.md reading, module identification, ORGANIZATION.md generation, independence and dependency analysis
- `actors` — multi-angle actor discovery (activities, threats, lifecycle), shared actor inheritance from parent to children
- `audit` — depth audit after compilation, 3 targeted auditors (spec coverage, actor coverage, cross-module coverage), gap detection and targeted fixes
- `codegen` — TypeScript skeleton generation from the node graph, LLM-driven implementation filling
- `testgen` — test skeleton generation from journey steps, LLM-driven assertion filling, test execution and failure fixing

## DEPENDENCIES

Build order (each layer depends only on layers above it):

1. `graph` — no dependencies, defines the core data structures
2. `llm` — no dependencies, standalone worker management
3. `compilation` — depends on `graph` (parses YAML into graph, validates structure)
4. `excerpt` — depends on `graph`, `compilation` (reads compiled graph to generate context)
5. `publish` — depends on `graph`, `compilation` (hashes compiled interfaces, writes event files)
6. `sync` — depends on `publish` (reads interface hashes to detect staleness)
7. `events` — depends on `sync`, `publish` (watches event files, triggers reconvergence via sync)
8. `organization` — depends on `llm` (LLM reads spec and identifies modules)
9. `actors` — depends on `llm`, `organization` (LLM discovers actors from org context)
10. `audit` — depends on `compilation`, `llm`, `graph` (auditors check compiled graph for coverage)
11. `codegen` — depends on `graph`, `llm` (generates code from nodes, LLM fills implementations)
12. `testgen` — depends on `graph`, `llm` (generates tests from journeys, LLM fills assertions)
13. `hierarchy` — depends on `organization`, `actors`, `convergence`, `publish` (splits org into children, collects interfaces)
14. `convergence` — depends on ALL above (orchestrates the full pipeline end to end)

## INDEPENDENCE

Fully standalone (no genome-specific dependencies):
- `graph` — generic node/journey/connection data model, usable by any graph system
- `llm` — generic Claude Code worker management, usable by any LLM orchestrator
- `events` — generic fs.watch event system, usable by any file-watching pipeline

Standalone with `graph`:
- `compilation` — generic YAML-to-graph validator, usable for any YAML module system
- `excerpt` — generic context summarizer, usable for any graph-based documentation
- `publish` — generic hash-and-publish system, usable for any artifact pipeline

Standalone pair:
- `codegen` + `testgen` — together form a standalone code generation system given any node/journey graph and an LLM worker

Tightly coupled to genome8:
- `convergence` — the orchestrator that wires everything together; IS the product
- `hierarchy` — genome8-specific parent/child splitting logic
- `organization` — genome8-specific spec-to-module discovery
- `actors` — genome8-specific multi-angle actor discovery
- `audit` — genome8-specific coverage auditing against spec
- `sync` — coupled to `publish` interface format; could generalize but currently genome8-specific
