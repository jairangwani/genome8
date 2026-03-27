/**
 * Genome8 Core Types — Universal
 *
 * 5 node types: actor, process, artifact, interface, rule
 * Journeys = use cases = connections = tests
 * Engine computes all connections from journey steps.
 */
// ── Helpers ──
export function resolveNodeRef(ref, currentModule) {
    if (!ref)
        return { module: currentModule, name: '' };
    if (ref.includes('/')) {
        const [mod, ...rest] = ref.split('/');
        return { module: mod, name: rest.join('/') };
    }
    return { module: currentModule, name: ref };
}
//# sourceMappingURL=types.js.map