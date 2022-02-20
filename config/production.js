module.exports = {

    database:{
        database: 'hoaxify',
        username: 'my-db-user',
        password: 'db-p4ss',
        dialect: 'sqlite',
        storage: './prod-db.sqlite',
        logging: false
    },
    mail:{
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'ezra.kautzer69@ethereal.email',
            pass: 'rNQCjCzk39bHRRpNNQ'
        }
    },
    uploadDir: 'uploads-production',
    profileDir: 'profile'

};