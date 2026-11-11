const http = require('http');
const fs = require('fs');
const server= http.createServer((req,res)=>{
    console.log("Request Made");
    console.log(req.url, req.method);
    res.setHeader('Content-Type', 'text/html');
    // res.write('<h1>Hello, World!</h1>');
    fs.readFile('./index.html', (err, data)=>{
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