const express = require('express');
const UserRouter = require('./user/UserRouter');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middlewre = require('i18next-http-middleware');

i18next
    .use(Backend)
    .use(middlewre.LanguageDetector)
    .init({

        fallbackLng: 'en',
        lng: 'en',
        ns: ['translation'],
        defaultNS: 'translation',
        backend:{
            loadPath: './locales/{{lng}}/{{ns}}.json'
        },
        detection:{
            lookupHeader: 'accept-language'
        }

    })
;

// [app]'s server
    const app = express();
// [app]'s server
// internationalization
    app.use(middlewre.handle(i18next));
// internationalization
// json body parser
    app.use(express.json());
// json body parser
// [router]
    app.use(UserRouter);
// [router]
// [err]or handler
    app.use((err, req, res, next)=>{
        const { status, message } = err;
        res.status(status).send({ message: req.t(message) });
    });
// [err]or handler
console.log('env: ' + process.env.NODE_ENV);

module.exports = app;

















