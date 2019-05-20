import { Component, html } from '../ui/base/component.js';
import hardtack from '../../../web_modules/hardtack.js';

export class DevModeSwitchComponent extends Component {
    constructor() {
        super();
        this.prodMode = hardtack.get('prodMode');
        this.switch = () => {
            if (!this.prodMode) {
                hardtack.set('prodMode', 'true', {});
            } else {
                hardtack.remove('prodMode', {});
            }
            window.location.reload();
        };
    }

    render() {
        return html`
            <div
                style="background: white; position: fixed; right: 1rem; bottom: 1rem; padding: 1rem; opacity: .5; z-index: 1000"
            >
                <button @click=${this.switch}>
                    ${this.prodMode ? 'Go to dev mode' : 'Go to production mode'}
                </button>
            </div>
        `;
    }
}
