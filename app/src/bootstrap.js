import { define } from './lib/define.js';
import { AppComponent, Out } from './ui/app.component.js';
import { store } from './state/store.js';

define(window, 'x-app', AppComponent, [store]);
define(window, 'x-out', Out);

// development mode switcher
(async () => {
    const m = await import('./dev/devModeSwitch.component.js');
    define(window, 'x-mode-switch', m.DevModeSwitchComponent);
    document.body.append(document.createElement('x-mode-switch'));
})();
