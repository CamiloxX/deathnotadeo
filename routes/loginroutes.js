const express =require('express');
const app=express();
const router=express.Router();
const bodyparser=require('body-parser');
const User=require('../schemas/userschemas');
const bcrypt=require('bcrypt');

app.set("view engine","pug");
app.set("views","views");

app.use(bodyparser.urlencoded({extended: false}));

router.get("/",(req,res,next)=>{
    res.status(200).render("login");
})


/*
router.post("/",async(req,res,next)=>{

    var payload=req.body;

    if(req.body.logUsername && req.body.logPassword){
        var user=await User.findOne({
            $or:[
                {username:req.body.logUsername},
                {password:req.body.logPassword}
            ]
        })

        .catch((err)=>{
            console.log(err);
            payload.errorMessage="Algo salió mal.";
            res.status(200).render("login",payload);
        });

        if(user!=null){

            var result =await bcrypt.compare(req.body.logPassword,user.password);

           if(result === true){
            req.session.user=user;
            return res.redirect("/registrarMuerte");
           }

        }

        payload.errorMessage="Usuario o Contraseña incorrectos."
        return res.status(200).render("login", payload);
    }
    
    payload.errorMessage="Asegurate que todos los campos tengan valores validos."
    res.status(200).render("login");
    
})
*/

router.post("/", (req, res, next) => {
    res.redirect("/registrarMuerte");
});

module.exports=router;