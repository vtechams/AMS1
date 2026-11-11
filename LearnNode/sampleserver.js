const http = require('http');
const fs = require('fs');
const server= http.createServer((req,res)=>{
    console.log("Request Made");
    const url= req.url;
    console.log(req.url, req.method);
    let path= './docs';
switch (url) {
    case '/':
        path+= '/home.html';
        break;
    case '/about':
        path+= '/about.html';
        break;  
    case '/contact':
        res.statusCode=301;
        res.setHeader('Location','/about');
        res.end();
default:
        path+= '/pagenot.html';
        res.statusCode= 404;
        break;
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