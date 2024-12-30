import path from 'path';
import fs from 'fs/promises'

import crypto from 'crypto';

class Dis {
    // different methods => commit method, add files method.
    // all are invoked from Dis class.
    constructor(repoPath = '.') {
        // makes sure that initialized folder => .git <=> .dis is created in the same 
        // directory where the class is invoked.
        this.repoPath = path.join(repoPath , '.dis');
        // Adding for other internal folders present in .git folder. 
        this.objectsPath = path.join(this.repoPath , 'objects'); // .dis/objects
        this.headPath = path.join(this.repoPath, 'HEAD'); // .dis/hooks
        this.indexPath = path.join(this.repoPath, 'index'); // .dis/index

        this.init();
    }

    async init() {
        //recursively creates an objects folder inside .dis folder.
        await fs.mkdir(this.objectsPath , { recursive:true });
        
        try {
            await fs.writeFile(this.headPath, '' , {flag: 'wx'});
            await fs.writeFile(this.indexPath, JSON.stringify([]), {flag: 'wx'});
            //wx is open for writing. fails if file exists 
        } catch (error) {
            console.log("Already initialized the .dis folder");
        }
    }

    hashObject(FileContent) {
        return crypto.createHash('sha1').update(FileContent, 'utf-8').digest('hex');
    }

    async add(fileToAdd) {
        const fileContent = await fs.readFile(fileToAdd , { encoding: 'utf-8' });
        const fileHash = this.hashObject(fileContent);

        console.log(fileHash);
        
        const fileHashedObjectPath = path.join(this.objectsPath, fileHash); //adds to the object path - .dis/objects/ea09ef093797db5044495be55c9a85cea2d1eb41
        await fs.writeFile(fileHashedObjectPath, fileContent); //adds the file changes into the new file.
    }
}

const dis = new Dis();
dis.add('demo.txt');