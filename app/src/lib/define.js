/**
 * Define the component which has to got the dependencies.
 *
 * @param {Window} window where to define components
 * @param {string} selector selector of component
 * @param {function(new: *, ...*)} constructor constructor of component
 * @param {Array<*> | function():Array<*>} [deps] list of deps or factory of deps
 */
export function define(window, selector, constructor, deps) {
    if (!deps || (Array.isArray(deps) && deps.length === 0)) {
        // doesnt support options - 2nd argument - for now
        window.customElements.define(selector, constructor);
    } else {
        const valuesDeps = Array.isArray(deps) ? deps : deps();
        // doesnt support options - 2nd argument- for now
        window.customElements.define(
            selector,
            class extends constructor {
                constructor() {
                    // @ts-ignore
                    super(...valuesDeps);
                }
            },
        );
    }
}
