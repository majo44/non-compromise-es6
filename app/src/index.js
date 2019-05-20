const polyfills = [];

if (window.customElements) {
    // prettier-ignore
    polyfills.push(
        // @ts-ignore
        import(/* webpackMode: "eager" */ '../../node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'),
    );
} else {
    // prettier-ignore
    polyfills.push(
        // @ts-ignore
        import(/* webpackChunkName: "polfill" */ '../../node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js'),
    );
}

if (!Object.assign) {
    // prettier-ignore
    polyfills.push(
        // @ts-ignore
        import(/* webpackChunkName: "polfill" */ '../../node_modules/es6-object-assign/dist/object-assign.min.js'),
    );
}

Promise.all(polyfills).then(() => import(/* webpackMode: "eager" */ './bootstrap.js'));
