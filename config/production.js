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
        service: "Gmail",
        // host: 'smtp.ethereal.email',
        // port: 587,
        auth: {
            user: "willsf9224@gmail.com",
            pass: "Unity2014!!@@"
        }
    },
    uploadDir: 'uploads-production',
    profileDir: 'profile'

};