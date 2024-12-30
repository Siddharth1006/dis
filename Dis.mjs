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
        const fileHashedObjectPath = path.join(this.objectsPath, fileHash); //adds to the object path - .dis/objects/ea09ef093797db5044495be55c9a85cea2d1eb41
        await fs.writeFile(fileHashedObjectPath, fileContent); //adds the file changes into the new file.
        await this.updateStagingArea(fileToAdd , fileHash);
        console.log(`Added ${fileToAdd}`);
    }

    async updateStagingArea(filePath , fileHash) {
        const index = JSON.parse(await fs.readFile(this.indexPath , { encoding: 'utf-8' })); // reads the existing content of index file
        
        index.push({ path : filePath , hash : fileHash }); // adds the file and the hash respectively to the array
        await fs.writeFile(this.indexPath , JSON.stringify(index)); // writing back the updated index to the index file
    }

    async commit(message) {
        const index = JSON.parse(await fs.readFile(this.indexPath , { encoding: 'utf-8' }));
        const parentCommit = await this.getCurrentHEAD();

        const commitData = {
            timeStamp: new Date().toISOString(),
            message,
            files: index,
            parent: parentCommit
        }

        //whenever we commit, a hash is generated. Stored in objects folder
        const commitHash = this.hashObject(JSON.stringify(commitData));
        const commitPath = path.join(this.objectsPath , commitHash);
        //write it to objects folder
        await fs.writeFile(commitPath, JSON.stringify(commitData));

        //updating the HEAD of the dis repo -> commitash
        await fs.writeFile(this.headPath, commitHash);
        await fs.writeFile(this.indexPath, JSON.stringify([])) // clears staging area
        console.log(`Commited the changes successfully! Commit id = ${commitHash}`);
    }

    async getCurrentHEAD() {
        try {
            return await fs.readFile(this.headPath , { encoding: 'utf-8' });
        } catch {
            return null; // first commit won't have HEAD. corner case
        }
    }

    async history() {
        let currentCommitHash = await this.getCurrentHEAD();
        console.log("****** Dis History *****")
        while (currentCommitHash) {
            const commitData = JSON.parse(await fs.readFile(path.join(this.objectsPath, currentCommitHash), { encoding: 'utf-8' }));
            console.log(`\nCommit: ${currentCommitHash}\nDate: ${commitData.timeStamp}\nCommit Message: ${commitData.message}\n`);

                currentCommitHash = commitData.parent; //point to parent hash
        }
    }
}

(async () => {
    const dis = new Dis();
    await dis.add('demo.txt');
    await dis.commit('Fifth commit');
    await dis.history();
})();