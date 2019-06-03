// import { createBrowserHistory } from '/web_modules/history.js';
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

function getLocationFullUrl() {
    return window.location.pathname
        + (window.location.search ? window.location.search : '')
        + (window.location.hash ? window.location.hash : '');
}

/**
 * @param {Store} store
 */
export const appRoutingModule = (store) => {
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
            navigate(store, getLocationFullUrl(), false);
        });

        window.addEventListener('popstate', () => {
            navigate(store, getLocationFullUrl());
        });

        // connecting to browser history
        store.on(
            EVENTS.NAVIGATION_ENDED,
            /**
             * @param {Navigation} navigation
             * @param {*} state
             */
            async (state, navigation) => {
                if (getLocationFullUrl() !== navigation.url) {
                    if (navigation.replace) {
                        window.history.replaceState({}, '', navigation.url);
                    } else {
                        window.history.pushState({}, '', navigation.url);
                    }
                }
            },
        );
    });
};
