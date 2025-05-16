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
    res.status(200).render("register");
})

router.post("/",async(req,res,next)=>{
    
    var firstName=req.body.firstName.trim();
    var lastName=req.body.lastName.trim();
    var username=req.body.username.trim();
    var email=req.body.email.trim();
    var password=req.body.password;

    var payload=req.body;

    if(firstName && lastName && username && email && password){
        var user=await User.findOne({
            $or:[
                {username:username},
                {email:email}
            ]
        })

        .catch((err)=>{
            console.log(err);
            payload.errorMessage="Algo salió mal.";
            res.status(200).render("register",payload);
        });

        if(user==null){
            var data=req.body;

            data.password=await bcrypt.hash(password,10);

            User.create(data)
            .then((user)=>{
                req.session.user=user;
                return res.redirect("/");
            })
        }
        else{
            if(email==user.email){
                payload.errorMessage="El correo ya está en uso."
            }else{
                payload.errorMessage="El nombre de usuario ya está en uso."
            }
            res.status(200).render("register", payload);
        }
    }
    else{
        payload.errorMessage="Asegurate que todos los campos tengan valores validos."
        res.status(200).render("register", payload);
    }
})


module.exports=router;