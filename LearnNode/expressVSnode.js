const exp = require('express');
const app = exp();
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
 
app.get('/', (req, res) => {
    res.sendFile('./docs/home.html',{root: __dirname});
});

app.get('/about', (req, res) => {
    res.sendFile('./docs/about.html',{root: __dirname});
});
app.get('/contact', (req, res) => {
    res.redirect('/about');
});
app.use((req, res) => {
    res.status(404).sendFile('./docs/pagenot.html',{root: __dirname});
}
);