module.exports = {

    database:{
        database: 'hoaxify',
        username: 'postgres',
        password: 'postgres',
        dialect: 'postgres',
        host: 'localhost',
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
    uploadDir: 'uploads-dev',
    profileDir: 'profile',
    attachmentDir: 'attachment'

};