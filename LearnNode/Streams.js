const sf=require('fs');

const readStream=sf.createReadStream('./docs/test.txt');

//readStream
readStream.on('data',(chunk)=>{
    console.log(chunk.toString());
})

//writeStream
const writeStream=sf.createWriteStream('./docs/test2.txt');
 readStream.on('data',(chunk)=>{
    writeStream.write(chunk);
 })
 
 //esay way to write data from one file to another file is using pipe method
 readStream.pipe(writeStream);