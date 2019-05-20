import { directive } from '../../../../web_modules/lit-html.js';
import { navigate } from '../../lib/storeonRoutingModule.js';

/**
 * @param {import('../../state/store').Store} store
 */
const routeLinkClickHandler = store =>
    /**
     * @param {MouseEvent} e
     */
    (e) => {
        if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) {
            return true;
        }

        const element = /** @type {HTMLAnchorElement} */ (e.currentTarget);

        if (element.hasAttribute('target') && element.getAttribute('target') !== '_self') {
            return true;
        }

        const replaceUrl = element.hasAttribute('replaceUrl');

        e.stopPropagation();
        e.preventDefault();

        navigate(store, element.getAttribute('href') || '', replaceUrl);
        return false;
    };

export const routerLink = directive(
    /**
     * @param {import('../../state/store').Store} store
     */
    store =>
        /**
         * @param {import('lit-html').EventPart} part
         */
        (part) => {
            // eslint-disable-next-line no-param-reassign
            part.eventName = 'click';
            part.setValue(/** @type {*} */ (routeLinkClickHandler(store)));
            part.commit();
        },
);
