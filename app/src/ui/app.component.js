import { navigate } from '../lib/storeonRoutingModule.js';
import { Component, html } from './base/component.js';
import { routerLink } from './directives/routerLink.directive.js';

export class Out extends Component {
    static get properties() {
        return {
            text: { type: String },
            count: { type: Number },
        };
    }

    constructor() {
        super();
        this.count = 0;
        this.text = '';
    }

    connectedCallback() {
        super.connectedCallback();
        this.requestUpdate();
    }

    render() {
        return html`
            <h3>${this.count} ${this.text}</h3>
        `;
    }
}

export class SlottedComponent extends Component {
    render() {
        return html`
            <div>
                <h3>Look at the slot</h3>
                <slot></slot>
            </div>
        `;
    }
}

export class AppComponent extends Component {
    static get properties() {
        return {};
    }

    /**
     * @param {import('../state/store').Store} store
     */
    constructor(store) {
        super();
        this.store = store;
        this.inc = () => store.dispatch('inc');
        this.dec = () => store.dispatch('dec');
        this.type = () => {
            if (this.shadowRoot) {
                store.dispatch(
                    'text',
                    /** @type {HTMLInputElement} */ (this.shadowRoot.querySelector('#in')).value,
                );
            }
        };
        store.on('@changed', async () => {
            this.requestUpdate();
        });
        document.addEventListener('navigate',
        /**
         * @param {Event} e
         */
            (e) => {
                const event = /** @type {CustomEvent<{url: string, replace: boolean}>} */ (e);
                navigate(store, event.detail.url, event.detail.replace);
            });
    }

    render() {
        const { routing } = this.store.get();
        return html`
            <div>
                <h1>Todo App 122</h1>
                <input type="text" @keyup=${this.type} id="in" />
                <button @click=${this.inc}>+</button>
                <button @click=${this.dec}>-</button>
                <a href="/home/1/2?a=1" @=${routerLink}><span>HOME 1/2</span></a>
                <a href="/home/1/2?a=2" @=${routerLink}><span>HOME 1/2</span></a>
                <a href="/home/1/3" @=${routerLink}>HOME 1/3</a>
                <a href="/admin" @=${routerLink}>AAA</a>
                <a href="/" @=${routerLink}>HOME 0</a>
                <x-slotted>
                    <x-out text=${this.store.get().text || ''} count=${this.store.get().count}></x-out>
                </x-slotted>
                ${routing.current ? html`<div>PAGE: ${routing.current.route}</div>` : html`Loading`}
            </div>
        `;
    }
}
