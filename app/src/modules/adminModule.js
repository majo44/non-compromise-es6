import { onNavigate } from '../lib/storeonRoutingModule.js';

/**
 * @param {*} store
 */
export function adminModule(store) {
    // registering own routing handler
    onNavigate(store, '/admin', async () => {
        // eslint-disable-next-line no-console
        console.log('ADMIN');
    });
}
