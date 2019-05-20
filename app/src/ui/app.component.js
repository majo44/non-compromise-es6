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
        this.type = () => store.dispatch(
            'text',
            /** @type {HTMLInputElement} */ (this.querySelector('#in')).value,
            true,
        );
        store.on('@changed', async () => {
            this.requestUpdate();
        });
    }

    render() {
        const rl = routerLink(this.store);
        // @ts-ignore
        return html`
            <div>
                <h1>Todo App 12</h1>
                <input type="text" @keyup=${this.type} id="in" />
                <button @click=${this.inc}>+</button>
                <button @click=${this.dec}>-</button>
                <a href="/home/1/2?a=1" @=${rl}><span>HOME 1/2</span></a>
                <a href="/home/1/2?a=2" @=${rl}><span>HOME 1/2</span></a>
                <a href="/home/1/3" @=${rl}>HOME 1/3</a>
                <a href="/aaa" @=${rl}>AAA</a>
                <a href="/" @=${rl}>HOME 0</a>
                <x-out text=${this.store.get().text || ''} count=${this.store.get().count}></x-out>
            </div>
        `;
    }
}
