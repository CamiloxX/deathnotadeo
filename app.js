const express =require('express');
const app=express();
const port=3003;
const middleware=require('./middleware')
const path=require('path')
const bodyparser=require('body-parser');
const mongoose=require("./database");
const session=require('express-session');


const server=app.listen(port,()=>console.log("Servidor en el puerto "+port));

app.use(session({
    secret:"hola papus",
    resave:true,
    saveUninitialized:false
}))

app.set("view engine","pug");
app.set("views","views");

app.use(bodyparser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,"public")));

//rutas
const loginroute =require('./routes/loginroutes')
const registerroute =require('./routes/registerroutes');
const logoutroute =require('./routes/logoutroutes');
const registrarMuerteRoute = require('./routes/registrarMuerteroutes');

const { connect } = require('http2');

const postsapiroute =require('./routes/api/posts');

app.use("/login",loginroute);
app.use("/register",registerroute);
app.use("/logout",logoutroute);
app.use('/registrarMuerte', registrarMuerteRoute);
app.use("/api/posts",postsapiroute);


app.get("/",middleware.requireLogin,(req,res,next)=>{
    var payload={
        pagetitle: "Inicio",
        userLoggedIn:req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
       }

    res.status(200).render("home",payload);
})

