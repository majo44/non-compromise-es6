import { Out } from './app.component.js';

function wait(time = 100) {
    return new Promise((res) => {
        setTimeout(() => {
            res();
        }, time);
    });
}

describe('e', () => {
    it('a', async () => {
        window.customElements.define('test-out', Out);
        await wait();
        document.body.innerHTML = '<test-out></test-out>';
        await wait();
        expect(document.body.innerHTML).to.matchSnapshot();
        // console.log( window.document.body.innerHTML);
        // let h = document.body.querySelector('h1');
    });
});
