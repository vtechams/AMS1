import express from "express";
const app = express();
const port=3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})

const users=[
    {id:1,name:"John"},
    {id:2,name:"Jane"},
    {id:3,name:"Bob"}
];
app.get("/users",(req,res)=>{
    res.send(users);
});

//task using params
const product=[
    {id:1,name:"Laptop"},
    {id:2,name:"Phone"},
    {id:3,name:"Tablet"}
];
app.get("/api/products/:id",(req,res)=>{
    const productId=parseInt(req.params.id);
    if(isNaN(productId)){
        return res.status(400).send("Bad Request change mam");
    }
    const costomerId=product.find(costomerId=>costomerId.id===productId);
    if(costomerId){
        return res.send(costomerId);
    }
    return res.status(404).send("Product not found");
});


//task is using query params like a search bar working
const products=[
    {id:1,name:"Laptop"},
    {id:2,name:"Phone"},
    {id:3,name:"Tablet"}
];
app.get("/api/products",(req,res)=>{
    const{query:{filter,productName}}=req;
    console.log(filter,productName);
    if(filter && productName){
        return res.send(products.filter(((product)=>product[filter].toLowerCase().includes(productName))));
    }
    return res.send(products);
});
