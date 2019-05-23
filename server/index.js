const path = require('path');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const app = express();

const production = true || process.env.node_env === 'production';
const port = process.env.PORT || 8008;

app.use(compression());
app.use(cookieParser());
app.use('/web_modules', express.static(path.join(__dirname, '../web_modules')));
app.use('/assets', express.static(path.join(__dirname, '../app/assets')));
if (production) {
    app.use('/app', express.static(path.join(__dirname, '../app/dist')));
} else {
    app.use('/app', (req, res, next) => {
        if (!req.cookies.prodMode) {
            express.static(path.join(__dirname, '../app/src'))(req, res, next);
        } else {
            express.static(path.join(__dirname, '../app/dist'))(req, res, next);
        }
    });
    app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));
}
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../app/index.html'));
});

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log('App server listen');
});
