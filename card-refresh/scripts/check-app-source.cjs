'use strict';
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const {appRoot}=require('./app-paths.cjs');
const lock=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../app-source.lock.json'),'utf8'));
const failures=[];
for(const [relative,expected] of Object.entries(lock.inputs)){
 const file=path.join(appRoot,relative);
 if(!fs.existsSync(file)){failures.push(relative+': missing');continue;}
 const actual=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 if(actual!==expected)failures.push(relative+': hash mismatch');
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(JSON.stringify({status:'PASS',inputFiles:Object.keys(lock.inputs).length,baselineCommit:lock.appBaselineCommit,workingTreeInputs:lock.workingTreeInputs}));
