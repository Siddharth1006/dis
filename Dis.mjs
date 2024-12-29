import path from 'path';

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
        
        //staging area
        this.indexPath = path.join(this.repoPath, 'index'); // .dis/index
    }
}