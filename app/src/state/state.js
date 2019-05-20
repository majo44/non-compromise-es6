/**
 * @typedef {import('../lib/storeonRoutingModule').RoutingState} RoutingState
 * @typedef {{
 *  count: number,
 *  text: string,
 *  routing: RoutingState
 *  }} State
 */

/**
 * @type {State}
 */
export const initState = {
    count: 0,
    text: '',
    routing: {
        nextHandleId: 0,
        nextNavigationId: 0,
        handles: [],
    },
};
