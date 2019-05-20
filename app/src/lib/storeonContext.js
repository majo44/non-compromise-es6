import sCreateStore from '../../../web_modules/storeon.js';

/**
 * @typedef {(event:PropertyKey, data?:any, context?:any) => void} StoreonDispatch
 */

/**
 * @template T
 * @typedef {function(ContextualStore<T>):void | import('storeon').Store<T>} StoreonModule
 */

/**
 * @template T
 * @typedef {function(T, *, StoreonDispatch, *):
 *      void | Promise<void> | Partial<T> | null } StoreonCallback
 */

/**
 * @template T
 * @typedef {{
 *     dispatch: StoreonDispatch,
 *     get: function():T,
 *     on: function(PropertyKey, StoreonCallback<T>): (function():void)
 * }} ContextualStore
 */

/**
 * @template T
 * @param {import('storeon').Store<T>} store
 * @return {ContextualStore<T>}
 */
function contextual(store) {
    /**
     * @param {*} parentCtx
     */
    const createDispatch = parentCtx => (
        /**
         * @param {PropertyKey} ev
         * @param {*} [data]
         * @param {*} [ctx]
         * @return {void}
         */
        (ev, data, ctx) => (ctx || parentCtx
            ? store.dispatch(ev, { data, ctx: Object.freeze({ ...parentCtx, ...ctx }) })
            : store.dispatch(ev, data)));
    const dispatch = store.dispatch.bind(store);
    return {
        get: store.get.bind(store),
        dispatch: (ev, data, ctx) => (
            ctx ? store.dispatch(ev, { data, ctx: Object.freeze(ctx) }) : store.dispatch(ev, data)),
        on: (ev, cb) => store.on(ev,
            (state, data) => /** @type {*} */ (data && data.ctx
                ? cb(state, data.data, createDispatch(data.ctx), data.ctx)
                : cb(state, data, dispatch, undefined))),
    };
}

/**
 * Creates store which supports context.
 * @template T
 * @param {Array<StoreonModule<T>>} modules
 * @return {ContextualStore<T>}
 */
export function createStore(modules) {
    const store = contextual(sCreateStore([]));
    modules.forEach(i => i && i(store));
    store.dispatch('@init');
    return store;
}
