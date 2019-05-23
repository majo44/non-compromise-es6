import { directive } from '../../../../web_modules/lit-html.js';

/**
 * @param {MouseEvent} e
 */
const routeLinkClickHandler = (e) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) {
        return true;
    }
    const element = /** @type {HTMLAnchorElement} */ (e.currentTarget);
    if (element.hasAttribute('target') && element.getAttribute('target') !== '_self') {
        return true;
    }
    const replace = element.hasAttribute('replaceUrl');
    e.stopPropagation();
    e.preventDefault();
    // Create the event.
    const event = /** @type {*} */ (document.createEvent('Event'));
    event.initEvent('navigate', true, true);
    event.detail = {
        url: element.getAttribute('href') || '',
        replace,
    };
    element.dispatchEvent(event);
    return false;
};

export const routerLink = directive(
    () =>
        /**
         * @param {import('lit-html').EventPart} part
         */
        (part) => {
            // eslint-disable-next-line no-param-reassign
            part.eventName = 'click';
            part.setValue(/** @type {*} */ (routeLinkClickHandler));
            part.commit();
        },
)();
