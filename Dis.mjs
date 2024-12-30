import path from 'path';
import fs from 'fs/promises'

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
        fs.mkdir(this.objectsPath , { recursive:true });
        
        try {
            fs.writeFile(this.headPath, '' , {flag: 'wx'});
            fs.writeFile(this.indexPath, JSON.stringify([]), {flag: 'wx'});
            //wx is open for writing. fails if file exists 
        } catch (error) {
            console.log("Already initialized the .dis folder");
        }
    }
}

const dis = new Dis();