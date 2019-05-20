import { createBrowserHistory } from '../../../web_modules/history.js';
import { ROUTING_EVENTS, onNavigate, navigate } from '../lib/storeonRoutingModule.js';

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

    store.on(
        ROUTING_EVENTS.NAVIGATION_ENDED,
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

    store.on('@init', async () => {
        onNavigate(store, '', () => {
            navigate(store, '/404');
        });

        onNavigate(store, '/', () => {
            // eslint-disable-next-line
            console.log('PAGE  HOME 0 ');
        });

        onNavigate(store, '/404', () => {
            // eslint-disable-next-line
            console.log('PAGE  404');
        });

        onNavigate(store, '/home/(.*)/(.*)', async (navigation, abortSignal) => {
            await new Promise(res => setTimeout(res, 1000));
            if (!abortSignal.aborted) {
                // eslint-disable-next-line
                console.log('PAGE  HOME');
            }
        });

        onNavigate(store, '/admin', async () => {
            // eslint-disable-next-line
            console.log('WAIT FOR  ADMIN');
            await new Promise(res => setTimeout(res, 1000));
            // eslint-disable-next-line
            console.log('PAGE ADMIN READY');
        });

        setTimeout(() => {
            const url = history.location.pathname
                + (history.location.search ? history.location.search : '')
                + (history.location.hash ? history.location.hash : '');
            navigate(store, url, true);
        });
    });
};
