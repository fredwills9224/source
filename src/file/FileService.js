const fs = require('fs');
const path = require('path');
const config = require('config');
const { randomString } = require('../shared/generator');

const { uploadDir , profileDir } = config;
const profileFolder = path.join('.', uploadDir, profileDir);
const createFolders = ()=>{

    if(!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir);
    }
    if(!fs.existsSync(profileFolder)){
        fs.mkdirSync(profileFolder);
    }

};
const saveProfileImage = (base64File)=>{

    const filename = randomString(32);
    const filePath = path.join(profileFolder, filename);
    // fs.writeFileSync(filePath, parseInt(base64File).toString(), { encoding: 'base64' });
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject)=>{

        fs.writeFile(filePath, parseInt(base64File).toString(), (error)=>{
            if(!error){
                resolve(filename);
            }else{
                // reject(error);
            }
        });

    });
    // return filename;

};

module.exports = { createFolders, saveProfileImage };