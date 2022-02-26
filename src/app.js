const express = require('express');
const UserRouter = require('./user/UserRouter');
const AuthenticationRouter = require('./auth/AuthenticationRouter');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middlewre = require('i18next-http-middleware');
const errorHandler = require('./error/ErrorHandler');
const tokenAuthentication = require('./middleware/tokenAuthentication');
const FileService = require('./file/FileService');
const config = require('config');
const path = require('path');
const HoaxRouter = require('./hoax/HoaxRouter');

const { uploadDir, profileDir } = config;
const profileFolder = path.join('.', uploadDir, profileDir);
const ONE_YEAR_IN_MILLIS = 365 * 24 * 60 * 60  * 1000;
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
    FileService.createFolders();
// [createFolders]
// [app]'s server
    const app = express();
// [app]'s server
// internationalization
    app.use(middlewre.handle(i18next));
// internationalization
// json body parser
    app.use(express.json({limit: '3mb'}));
// json body parser
// serving static files sending cache's [maxAge] in ms to [express]. [exress] converts to s in [headers]
    app.use('/images', express.static(profileFolder, {maxAge: ONE_YEAR_IN_MILLIS}));
// serving static files sending cache's [maxAge] in ms to [express]. [exress] converts to s in [headers]
// [tokenAuthentication]
    app.use(tokenAuthentication);
// [tokenAuthentication]
// [UserRouter]
    app.use(UserRouter);
// [UserRouter]
// [AuthenticationRouter]
    app.use(AuthenticationRouter);
// [AuthenticationRouter]
// [HoaxRouter]
    app.use(HoaxRouter);
// [HoaxRouter]
// [errorHandler] as middleware
    app.use(errorHandler);
// [errorHandler] as middleware

console.log('env: ' + process.env.NODE_ENV);

module.exports = app;