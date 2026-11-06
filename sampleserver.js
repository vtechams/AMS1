const http = require('http');
const fs = require('fs');
const server= http.createServer((req,res)=>{
    console.log("Request Made");
    const url= req.url;
    let path= './docs';
    if(url=== '/' || url=== '/index.html'){
        path+= '/home.html';
    }else if(url=== '/about'){
        path+= '/about.html';
    }else{
        path+= '/pagenot.html';
    }
    fs.readFile(path, (err, data)=>{
        if(err){
            console.log(err);
            res.end();
        } else {
            res.write(data);
            res.end();
        } 
    });
})

server.listen(3000, "localhost", ()=>{
    console.log("Listening on port 3000");
})