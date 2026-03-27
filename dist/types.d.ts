/**
 * Genome8 Core Types — Universal
 *
 * 5 node types: actor, process, artifact, interface, rule
 * Journeys = use cases = connections = tests
 * Engine computes all connections from journey steps.
 */
export interface ModuleFile {
    spec_sections?: number[];
    nodes: Record<string, ModuleNode>;
    journeys?: Record<string, ModuleJourney>;
    _parseError?: string;
}
export interface ModuleNode {
    type: 'actor' | 'process' | 'artifact' | 'interface' | 'rule';
    description: string;
    properties?: Record<string, unknown>;
    files?: string[];
    [key: string]: unknown;
}
export interface ModuleJourney {
    description?: string;
    steps: JourneyStep[];
}
export interface JourneyStep {
    node: string;
    action: string;
}
export interface CompiledIndex {
    _compiled: string;
    _stats: CompiledStats;
    nodes: Record<string, CompiledNode>;
    journeys: Record<string, CompiledJourney>;
}
export interface CompiledStats {
    total_nodes: number;
    total_journeys: number;
    total_connections: number;
    modules: number;
    orphans: number;
    isolated_modules: number;
    duplicate_names: number;
}
export interface CompiledNode {
    module: string;
    type: string;
    description: string;
    preceded_by: string[];
    followed_by: string[];
    in_journeys: string[];
    triggered_by_actors: string[];
    cross_module_connections: string[];
    referenced_in_modules: string[];
    properties?: Record<string, unknown>;
    files?: string[];
}
export interface CompiledJourney {
    name: string;
    module: string;
    actor: string | null;
    steps: {
        node: string;
        action: string;
        step_number: number;
    }[];
    modules_touched: string[];
}
export type Severity = 'error' | 'warning';
export interface ValidationIssue {
    severity: Severity;
    module: string;
    message: string;
    node?: string;
    journey?: string;
}
export interface CoverageReport {
    _generated: string;
    modules: Record<string, ModuleCoverage>;
    orphans: string[];
    isolated_modules: string[];
}
export interface ModuleCoverage {
    nodes: number;
    journeys: number;
    connections: number;
    cross_module_connections: number;
    spec_sections: number[];
}
export interface PublishedInterface {
    engine: string;
    version_hash: string;
    provides: Record<string, {
        type: string;
        description: string;
        in_journeys: number;
    }>;
    requires: Record<string, string>;
}
export interface ChangelogEntry {
    node: string;
    type: 'added' | 'modified' | 'removed';
    field?: string;
    was?: unknown;
    now?: unknown;
    impact: string;
}
export interface Changelog {
    previous_hash: string;
    current_hash: string;
    changes: ChangelogEntry[];
}
export interface DependencyConfig {
    pin: string;
    alert_on_update?: boolean;
    fallback?: string;
}
export interface DependenciesFile {
    dependencies: Record<string, DependencyConfig>;
}
export declare function resolveNodeRef(ref: string, currentModule: string): {
    module: string;
    name: string;
};
