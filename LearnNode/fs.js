const f=require('fs');
const path=require('path');

// everything in fs module is synchronous and asynchronous(so run at the same time) so we have to use callback function to handle the error and data

//create directory
if(!f.existsSync('./docs')){
f.mkdir(path.join('docs'),(err)=>{
    if(err){
        console.log(err.message);
        return;
    
    }
    else{
    console.log("Created")
    }
})
}

//write file
f.writeFile('./docs/test.txt', 'Hello World! Don', (err) => {
    if (err) {
        console.log(err.message);
        return;
    }
    console.log("File written");
})

//read file
if(f.existsSync('./docs/test.txt')){
f.readFile('./docs/test.txt',(err,data)=>{
    if(err){
        console.log(err.message);
    }
    else{
        console.log(data.toString());
    }
})
}

//delete file

// if(f.existsSync('./docs/test.txt')){
//     f.unlink('./docs/test.txt',(err)=>{
//         if(err){
//             console.log(err.message);
//         }
//         else{
//             console.log("File Deleted");
//         }
//     })
// }

//delete directory

// if(f.existsSync('./docs')){
// f.rmdir('./docs',(err)=>{
//     if(err){
//         console.log(err.message);

//     }
//     else{
//         console.log("Directory Deleted");
//     }
// })
// }