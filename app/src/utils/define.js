export function define(window, selector, constructor, deps) {
    if (!deps || (Array.isArray(deps) && deps.length === 0)) {
        window.customElements.define(selector, constructor);
    } else {
        const valuesDeps = Array.isArray(deps) ? deps : deps();
        // doesnt support options - 2nd argument- for now
        window.customElements.define(
            selector,
            class extends constructor {
                constructor() {
                    super(...valuesDeps);
                }
            },
        );
    }
}
