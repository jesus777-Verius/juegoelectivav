const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const port = 3000;
app.use(cors());
app.use(express.json());
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.get('/',(req,res)=>{
	res.render('index');
});
app.listen(port,()=>{
console.log(`Servidor iniciado http://localhost:${port}`);
});

