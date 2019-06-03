/**
 * @typedef {{
 *      id?: number,
 *      url: string,
 *      replace?: boolean,
 *      force?:boolean,
 *      async?: boolean
 * }} Navigation represents ongoing navigation
 *
 * @typedef {Navigation & {
 *      params?: Object.<PropertyKey, string>,
 *      route: string
 * }} NavigationState represents state of navigation
 *
 * @typedef {{
 *      handles: Array.<{id:number, route: string}>,
 *      nextHandleId: number,
 *      nextNavigationId: number,
 *      current?: NavigationState
 *      next?: Navigation
 * }} RoutingState routing state
 *
 * @typedef {function(Navigation, AbortSignal): (void | Promise.<void>)} RouteCallback
 *      callback for route navigation
 *
 * @typedef {{routing: RoutingState}} StateWithRouting
 *      app state with routing module installed
 */

/**
 * Registered routes cache.
 * @type {Object.<number, {id: number, route: string, regexp: RegExp, callback: RouteCallback}>}
 */
const routes = {};

export const EVENTS = {
    /**
     * Action which you should dispatch when you want to start new navigation.
     */
    NAVIGATE: Symbol('NAVIGATE'),
    BEFORE_NAVIGATION: Symbol('BEFORE_NAVIGATION'),
    POSTPONE_NAVIGATION: Symbol('POSTPONE_NAVIGATION'),
    CANCEL_NAVIGATION: Symbol('CANCEL_NAVIGATION'),
    REGISTER_ROUTE: Symbol('REGISTER_ROUTE'),
    UNREGISTER_ROUTE: Symbol('UNREGISTER_ROUTE'),
    NAVIGATION_ENDED: Symbol('NAVIGATION_ENDED'),
    NAVIGATION_IGNORED: Symbol('NAVIGATION_IGNORED'),
    NAVIGATION_CANCELLED: Symbol('NAVIGATION_CANCELLED'),
};

/**
 * Stereon router module.
 * Register the routing workflow.
 *
 * @public
 * @param {import('storeon').Store<StateWithRouting>} store store instace
 *
 * @example
 * import sreateStore from 'storeon';
 * // add module to storeon
 * const store = createStore([storeonRoutingModule]);
 * // handle route
 * onNavigate(store, '/home', () => {
 *    console.log('home page');
 * });
 * // navigate
 * navigate('/home');
 * // getting current
 * store.get().routing.current.route; // => '/home'
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
        EVENTS.NAVIGATE,
        /**
         * @param {StateWithRouting} state
         * @param {RoutingState} state.routing
         * @param {string | Navigation} n
         * @return {StateWithRouting | null}
         */
        ({ routing }, n) => {
            /**
             * @type {Navigation}
             */
            let _n;
            // normalize argument
            if (typeof n === 'string') {
                _n = { url: n, id: routing.nextNavigationId };
            } else {
                _n = { ...n, id: routing.nextNavigationId };
            }

            // if is navigation in progress
            if (routing.next) {
                // if is for same url and not forced
                if (routing.next.url === _n.url && !_n.force) {
                    // we will ignore this navigation request
                    store.dispatch(EVENTS.NAVIGATION_IGNORED, 'currently in progress');
                    return null;
                }
                // dispatch cancellation
                store.dispatch(EVENTS.NAVIGATION_CANCELLED, routing.next);
            }

            // if the navigation is to same url as current
            if (
                routing.current
                && routing.current.url === _n.url
                && !_n.force
            ) {
                // we will ignore this navigation request
                store.dispatch(EVENTS.NAVIGATION_IGNORED, 'same as current');
                return null;
            }

            // After state update
            Promise.resolve().then(() => {
                // dispatch before navigation event
                store.dispatch(EVENTS.BEFORE_NAVIGATION, _n);
            });

            // update state
            return {
                routing: {
                    ...routing,
                    next: _n,
                    nextNavigationId: routing.nextNavigationId + 1,
                },
            };
        },
    );

    store.on(
        EVENTS.NAVIGATION_CANCELLED,
        /**
         * @param {StateWithRouting} state
         * @param {RoutingState} state.routing
         */
        ({ routing }) => ({ routing: { ...routing, next: undefined } }),
    );

    store.on(
        EVENTS.NAVIGATION_ENDED,
        /**
         * @param {StateWithRouting} state
         * @param {RoutingState} state.routing
         * @param {NavigationState} n
         */
        ({ routing }, n) => ({
            routing: { ...routing, next: undefined, current: n },
        }),
    );

    store.on(
        EVENTS.POSTPONE_NAVIGATION,
        /**
         * @param {StateWithRouting} s
         * @return {StateWithRouting}
         */
        (s) => {
            if (!s.routing.next) {
                throw new Error('IllegalStateException');
            }
            return {
                routing: {
                    ...s.routing,
                    next: {
                        ...s.routing.next,
                        async: true,
                    },
                },
            };
        },
    );

    store.on(
        EVENTS.CANCEL_NAVIGATION,
        /**
         * @param {StateWithRouting} s
         * @param {Navigation} n
         */
        async (s, n) => {
            store.dispatch(EVENTS.NAVIGATION_CANCELLED, n);
        },
    );

    store.on(
        EVENTS.BEFORE_NAVIGATION,
        /**
         * @param {StateWithRouting} s
         * @param {RoutingState} s.routing
         * @param {NavigationState} n
         */
        async (s, n) => {
            /**
             * @type {RegExpMatchArray | null}
             */
            let match = null;
            /**
             * @type {string}
             */
            let route = '';
            const handle = s.routing.handles.find(({ id }) => {
                match = n.url.match(routes[id].regexp);
                ({ route } = routes[id]);
                return !!match;
            });
            if (handle) {
                /**
                 * @type {NavigationState}
                 */
                const navigation = {
                    ...n,
                    route,
                    params: {
                        .../** @type {*} */(match).groups,
                        .../** @type {*} */(match).splice(1),
                    },
                };
                const { callback } = routes[handle.id];
                const ac = new AbortController();
                const disconnect = store.on(
                    EVENTS.NAVIGATION_CANCELLED,
                    async () => ac.abort(),
                );
                const callbackResult = callback(navigation, ac.signal);
                if (callbackResult && typeof callbackResult.then === 'function') {
                    store.dispatch(EVENTS.POSTPONE_NAVIGATION, navigation);
                    await callbackResult;
                    if (!ac.signal.aborted) {
                        store.dispatch(EVENTS.NAVIGATION_ENDED, navigation);
                    }
                } else {
                    const { next } = store.get().routing;
                    if (next && next.id === navigation.id) {
                        store.dispatch(EVENTS.NAVIGATION_ENDED, navigation);
                    }
                }
                disconnect();
            } else {
                throw new Error(`There was no route registered for requested navigation to ${n.url}`);
            }
        },
    );

    store.on(
        EVENTS.REGISTER_ROUTE,
        /**
         * @param {StateWithRouting} s
         * @param {{id:number, route: string}} h
         * @return {StateWithRouting}
         */
        (s, h) => ({
            routing: {
                ...s.routing,
                nextHandleId: s.routing.nextHandleId + 1,
                handles: [h, ...s.routing.handles],
            },
        }),
    );

    store.on(
        EVENTS.UNREGISTER_ROUTE,
        /**
         * @param {StateWithRouting} s
         * @param {{id:number, route: string}} h
         * @return {StateWithRouting}
         */
        (s, h) => ({
            routing: {
                ...s.routing,
                handles: s.routing.handles.filter(i => i.id !== h.id),
            },
        }),
    );
    store.on(EVENTS.NAVIGATION_IGNORED, async () => {});
};

/**
 * Register the route handler to top of stack of handles.
 *
 * @param {import('storeon').Store.<StateWithRouting>} store on store
 * @param {string} route the route regexp string
 * @param {RouteCallback} callback the callback which will be called on provided route
 *
 * @return {function(): void} unregistering rute handle
 *
 * @example simple
 * onNavigate(store, '/home', () => console.log('going home'));
 *
 * @example redirection
 * onNavigate(store, '', () => navigate(store, '/404'));
 *
 * @example lazy loading
 * // admin page - lazy loading of modul'/admin', async (navigation, abortSignal) => {
 *      // preload module
 *      const adminModule = await import('/modules/adminModule.js');
 *      // if not aborted
 *      if (!abortSignal.aborted) {
 *          // unregister app level route handle
 *          unRegister();
 *          // init module, which will register own handle for same route
 *          adminModule.adminModule(store);
 *          // navigate once again (with force flag)
 *          navigate(store, navigation.url, false, true);
 *      }
 * });
 */
export function onNavigate(store, route, callback) {
    const id = store.get().routing.nextHandleId;
    routes[id] = {
        id, callback, route, regexp: new RegExp(route),
    };
    const routeDef = { id, route };
    store.dispatch(EVENTS.REGISTER_ROUTE, routeDef);
    return () => {
        delete routes[id];
        store.dispatch(EVENTS.UNREGISTER_ROUTE, routeDef);
    };
}

/**
 * Navigate to provided route.
 *
 * @param {import('storeon').Store.<StateWithRouting>} store on store
 * @param {string} url to url
 * @param {boolean} [replace] replace url
 * @param {boolean} [force] force navigation (even there is ongoing attempt for same route)
 */
export function navigate(store, url, replace, force) {
    store.dispatch(EVENTS.NAVIGATE, { url, replace, force });
}

/**
 * Cancel current navigation.
 * @param {import('storeon').Store.<StateWithRouting>} store
 */
export function cancelNavigation(store) {
    store.dispatch(EVENTS.CANCEL_NAVIGATION);
}
