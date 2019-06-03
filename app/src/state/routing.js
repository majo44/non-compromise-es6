import { createBrowserHistory } from '/web_modules/history.js';
import { EVENTS, onNavigate, navigate } from '../lib/storeonRoutingModule.js';

export const ROUTES = {
    ADMIN: '/admin',
    HOME: '/home',
    USERS: '/users/?(.*?)',
    USER: '/user/(.*?)',
    NOT_FOUND: '/404',
};

/**
 * @typedef {import('../lib/storeonRoutingModule.js').Navigation} Navigation
 * @typedef {import('../lib/storeonRoutingModule.js').StateWithRouting} StateWithRouting
 * @typedef {import('storeon').Store<StateWithRouting>} Store
 */

/**
 * @param {Store} store
 */
export const appRoutingModule = (store) => {
    const history = createBrowserHistory();

    history.listen((location, action) => {
        if (action === 'POP') {
            navigate(store, location.pathname, true);
        }
    });

    // connecting to browser history
    store.on(
        EVENTS.NAVIGATION_ENDED,
        /**
         * @param {Navigation} navigation
         * @param {*} state
         */
        async (state, navigation) => {
            if (navigation.replace) {
                history.replace(navigation.url);
            } else {
                history.push(navigation.url);
            }
        },
    );
    // we have to register routes after the @init
    store.on('@init', async () => {
        // on non matched, redirect to 404
        onNavigate(store, '', () => navigate(store, ROUTES.NOT_FOUND));
        // home
        onNavigate(store, ROUTES.HOME, async (navigation, abortSignal) => {
            await new Promise(res => setTimeout(res, 1000));
            if (!abortSignal.aborted) {
                // eslint-disable-next-line
                console.log('PAGE  HOME', navigation);
            }
        });
        // 404
        onNavigate(store, ROUTES.NOT_FOUND, () => {});

        // admin page - lazy loading of module
        const unRegister = onNavigate(store, ROUTES.ADMIN, async (navigation, abortSignal) => {
            // preload module
            const adminModule = await import('../modules/adminModule.js');
            // if not aborted
            if (!abortSignal.aborted) {
                // unregister app level route handle
                unRegister();
                // init module
                adminModule.adminModule(store);
                // navigate once again (with force flag)
                navigate(store, navigation.url, false, true);
            }
        });

        // on application start navigate to current url
        setTimeout(() => {
            const url = history.location.pathname
                + (history.location.search ? history.location.search : '')
                + (history.location.hash ? history.location.hash : '');
            navigate(store, url, true);
        });
    });
};
