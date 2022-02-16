const FileService = require('../src/file/FileService');
const fs = require('fs');

describe('createFolders', ()=>{

    it('creates upload folder', ()=>{

        FileService.creatFolders();
        const folderName = 'upload';
        expect(fs.existsSync(folderName)).toBe(true);

    });

});