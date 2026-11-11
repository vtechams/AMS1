const exp = require('express');
const app=exp();
app.listen(3000);

//middleware 1
app.use((req,res,next)=>{
    console.log('middleware 1');
    console.log("Request path is:"+req.path);
    next(); 
});
app.get ('/',(req,res)=>{
    res.sendFile('./docs/home.html',{root:__dirname});
});
app.get('/about',(req,res)=>{
res.sendFile('./docs/about.html',{root:__dirname});
});

//middleware 2
app.use((req,res,next)=>{
    console.log('middleware 2');
    next(); 
});

app.get('/contact',(req,res)=>{
res.redirect('/about');
});

app.use((req,res)=>{
    res.sendFile('./docs/pagenot.html',{root:__dirname});
})

// about and home run not run because middleware 2 is after them so it will not run for them but it will run for contact and pagenotfound because they are after middleware 2