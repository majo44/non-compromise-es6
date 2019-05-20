/**
 * @typedef {{
 *      id?: number,
 *      url: string,
 *      params?: Object.<PropertyKey, string>,
 *      replace?: boolean,
 *      force?:boolean,
 *      async?: boolean
 * }} Navigation
 *
 * @typedef {{
 *      handles: Array.<{id:number, route: string}>,
 *      nextHandleId: number,
 *      nextNavigationId: number,
 *      current?: Navigation
 *      next?: Navigation
 * }} RoutingState
 *
 * @typedef {function(Navigation, AbortSignal): (void | Promise.<void>)} RouteCallback
 *
 * @typedef {{routing: RoutingState}} StateWithRouting
 */

/**
 * @type {Object.<number, {id: number, route: string, regexp: RegExp, callback: RouteCallback}>}
 */
const routes = {};

export const ROUTING_EVENTS = {
    /**
     * Action which you should dispatch when you want to start new navigation.
     */
    NAVIGATE: Symbol('NAVIGATE'),
    BEFORE_NAVIGATION: Symbol('BEFORE_NAVIGATION'),
    POSTPONE_NAVIGATION: Symbol('POSTPONE_NAVIGATION'),
    CANCEL_NAVIGATION: Symbol('CANCEL_NAVIGATION'),
    REGISTER_ROUTE: Symbol('REGISTER_ROUTE'),
    NAVIGATION_ENDED: Symbol('NAVIGATION_ENDED'),
    NAVIGATION_IGNORED: Symbol('NAVIGATION_IGNORED'),
    NAVIGATION_CANCELLED: Symbol('NAVIGATION_CANCELLED'),
};

/**
 * @param {import('storeon').Store<StateWithRouting>} store
 */
export const storeonRoutingModule = (store) => {
    /**
     * Set default state on initialization.
     */
    store.on('@init', () => ({
        routing: {
            handles: [],
            nextHandleId: 0,
            nextNavigationId: 0,
        },
    }));

    /**
     * Handling navigate action.
     */
    store.on(
        ROUTING_EVENTS.NAVIGATE,
        /**
         * @param {StateWithRouting} state
         * @param {RoutingState} state.routing
         * @param {string | Navigation} nav
         * @return {StateWithRouting | null}
         */
        ({ routing }, nav) => {
            /**
             * @type {Navigation}
             */
            let navigation;
            // normalize argument
            if (typeof nav === 'string') {
                navigation = { url: nav, id: routing.nextNavigationId };
            } else {
                navigation = { ...nav, id: routing.nextNavigationId };
            }

            // if is navigation in progress
            if (routing.next) {
                // if is for same url and not forced
                if (routing.next.url === navigation.url && !navigation.force) {
                    // we will ignore this navigation request
                    store.dispatch(ROUTING_EVENTS.NAVIGATION_IGNORED, 'currently in progress');
                    return null;
                }
                // dispatch cancellation
                store.dispatch(ROUTING_EVENTS.NAVIGATION_CANCELLED, routing.next);
            }

            // if the navigation is to same url as current
            if (
                routing.current
                && routing.current.url === navigation.url
                && !navigation.force
            ) {
                // we will ignore this navigation request
                store.dispatch(ROUTING_EVENTS.NAVIGATION_IGNORED, 'same as current');
                return null;
            }

            // After state update
            Promise.resolve().then(() => {
                // dispatch before navigation event
                if (store.get().routing.next && store.get().routing.next === navigation) {
                    store.dispatch(ROUTING_EVENTS.BEFORE_NAVIGATION, navigation);
                    // asynchronously check for navigation interruption
                    Promise.resolve().then(() => {
                        const { next } = store.get().routing;
                        if (next && !next.async) {
                            store.dispatch(
                                ROUTING_EVENTS.NAVIGATION_ENDED,
                                store.get().routing.next,
                            );
                        }
                    });
                }
            });

            // update state
            return {
                routing: {
                    ...routing,
                    next: navigation,
                    nextNavigationId: routing.nextNavigationId + 1,
                },
            };
        },
    );

    store.on(
        ROUTING_EVENTS.NAVIGATION_CANCELLED,
        /**
         * @param {StateWithRouting} state
         * @param {RoutingState} state.routing
         */
        ({ routing }) => ({ routing: { ...routing, next: undefined } }),
    );

    store.on(
        ROUTING_EVENTS.NAVIGATION_ENDED,
        /**
         * @param {StateWithRouting} state
         * @param {RoutingState} state.routing
         */
        ({ routing }) => ({
            routing: { ...routing, next: undefined, current: routing.next },
        }),
    );

    store.on(
        ROUTING_EVENTS.POSTPONE_NAVIGATION,
        /**
         * @param {StateWithRouting} state
         * @return {StateWithRouting}
         */
        (state) => {
            if (!state.routing.next) {
                throw new Error('IllegalStateException');
            }
            return {
                routing: {
                    ...state.routing,
                    next: {
                        ...state.routing.next,
                        async: true,
                    },
                },
            };
        },
    );

    store.on(
        ROUTING_EVENTS.CANCEL_NAVIGATION,
        /**
         * @param {StateWithRouting} state
         * @param {Navigation} navigation
         */
        async (state, navigation) => {
            store.dispatch(ROUTING_EVENTS.NAVIGATION_CANCELLED, navigation);
        },
    );

    store.on(
        ROUTING_EVENTS.BEFORE_NAVIGATION,
        /**
         * @param {StateWithRouting} state
         * @param {RoutingState} state.routing
         * @param {Navigation} nav
         */
        async (state, nav) => {
            /**
             * @type {RegExpMatchArray | null}
             */
            let match = null;
            const handle = state.routing.handles.find(({ id }) => {
                match = nav.url.match(routes[id].regexp);
                return !!match;
            });
            if (handle) {
                const navigation = {
                    ...nav,
                    params: {
                        .../** @type {*} */(match).groups,
                        .../** @type {*} */(match).splice(1),
                    },
                };
                const { callback } = routes[handle.id];
                const ac = new AbortController();
                const disconnect = store.on(
                    ROUTING_EVENTS.NAVIGATION_CANCELLED,
                    async () => ac.abort(),
                );
                const callbackResult = callback(navigation, ac.signal);
                if (callbackResult && typeof callbackResult.then === 'function') {
                    store.dispatch(ROUTING_EVENTS.POSTPONE_NAVIGATION, navigation);
                    await callbackResult;
                    if (!ac.signal.aborted) {
                        store.dispatch(ROUTING_EVENTS.NAVIGATION_ENDED, navigation);
                    }
                }
                disconnect();
            } else {
                throw new Error(`There was no route registered for requested navigation to ${nav.url}`);
            }
        },
    );

    store.on(
        ROUTING_EVENTS.REGISTER_ROUTE,
        /**
         * @param {StateWithRouting} state
         * @param {{id:number, route: string}} handle
         * @return {StateWithRouting}
         */
        (state, handle) => ({
            routing: {
                ...state.routing,
                nextHandleId: state.routing.nextHandleId + 1,
                handles: [handle, ...state.routing.handles],
            },
        }),
    );

    store.on(ROUTING_EVENTS.NAVIGATION_IGNORED, async () => {});
};

/**
 * @param {import('storeon').Store.<StateWithRouting>} store
 * @param {string} route
 * @param {RouteCallback} callback
 */
export function onNavigate(store, route, callback) {
    const id = store.get().routing.nextHandleId;
    routes[id] = {
        id, callback, route, regexp: new RegExp(route),
    };
    store.dispatch(ROUTING_EVENTS.REGISTER_ROUTE, { id, route });
}

/**
 * @param {import('storeon').Store.<StateWithRouting>} store
 * @param {string} url
 * @param {boolean} [replace]
 * @param {boolean} [force]
 */
export function navigate(store, url, replace, force) {
    store.dispatch(ROUTING_EVENTS.NAVIGATE, { url, replace, force });
}
