import storeonDevTools from '../../../web_modules/storeonDevTools.js';
import storeonLogger from '../../../web_modules/storeonLoggerBrowser.js';

import { createStore } from '../lib/storeonContext.js';
import { production } from '../env.js';
import { storeonRoutingModule } from '../lib/storeonRoutingModule.js';
import { appRoutingModule } from './routing.js';
import { initState } from './state.js';

/**
 * @typedef {import('./state').State} State
 * @typedef {import('../lib/storeonContext').ContextualStore<State>} Store
 * @typedef {import('../lib/storeonContext').StoreonModule<State>} StoreonModule
 */

/**
 * @param {Store} store
 */
const increment = (store) => {
    // Initial state
    store.on('@init', () => initState);
    // Reducers returns only changed part of the state
    store.on('inc', state => ({ count: state.count + 1 }));
    // Reducers returns only changed part of the state
    store.on('dec', ({ count }) => ({ count: count - 1 }));
    // Reducers returns only changed part of the state
    store.on('text', (state, text) => ({ text }));
};

/**
 * @type {Array<StoreonModule>}
 */
const modules = [increment, storeonRoutingModule, appRoutingModule];

if (!production) {
    modules.push(storeonDevTools);
    modules.push(storeonLogger);
}

export const store = createStore(modules);
