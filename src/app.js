const express = require('express');
const UserRouter = require('./user/UserRouter');
const AuthenticationRouter = require('./auth/AuthenticationRouter');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middlewre = require('i18next-http-middleware');
const errorHandler = require('./error/ErrorHandler');
const tokenAuthentication = require('./middleware/tokenAuthentication');
const fileService = require('./file/FileService');

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

// [createFolders]
    fileService.createFolders();
// [createFolders]
// [app]'s server
    const app = express();
// [app]'s server
// internationalization
    app.use(middlewre.handle(i18next));
// internationalization
// json body parser
    app.use(express.json());
// json body parser
// [tokenAuthentication]
    app.use(tokenAuthentication);
// [tokenAuthentication]
// [UserRouter]
    app.use(UserRouter);
// [UserRouter]
// [AuthenticationRouter]
    app.use(AuthenticationRouter);
// [AuthenticationRouter]
// [errorHandler] as middleware
    app.use(errorHandler);
// [errorHandler] as middleware

console.log('env: ' + process.env.NODE_ENV);

module.exports = app;