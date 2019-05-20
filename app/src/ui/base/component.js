import { LitElement } from '../../../../web_modules/lit-element.js';

export { html, css, svg } from '../../../../web_modules/lit-element.js';

export class Component extends LitElement {
    static get properties() {
        return {};
    }

    createRenderRoot() {
        return this;
    }
}
