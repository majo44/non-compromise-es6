import { define } from './lib/define.js';
import { AppComponent, Out, SlottedComponent } from './ui/app.component.js';
import { store } from './state/store.js';

const supportDevMode = true;

define(window, 'x-app', AppComponent, [store]);
define(window, 'x-out', Out);
define(window, 'x-slotted', SlottedComponent);

// development mode switcher
if (supportDevMode) {
    (async () => {
        const m = await import('./dev/devModeSwitch.component.js');
        define(window, 'x-mode-switch', m.DevModeSwitchComponent);
        document.body.append(document.createElement('x-mode-switch'));
    })();
}
