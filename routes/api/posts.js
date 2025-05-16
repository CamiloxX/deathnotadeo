const express =require('express');
const app=express();
const router=express.Router();
const bodyparser=require('body-parser');
const User=require('../../schemas/userschemas');
const Post=require('../../schemas/postschema');

app.use(bodyparser.urlencoded({extended: false}));

router.get("/", async (req,res,next)=>{
    var results = await getPosts({});
    res.status(200).send(results);

    /*
    Post.find()
    .populate("postedBy")
    .populate("retweetData")
    .sort({"createdAt":-1})
    
    .then(async results=>{
        results=await User.populate(results,{path:"retweetData.postedBy"});
        res.status(200).send(results);
    })
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    })*/

})

router.get("/:id", async (req,res,next)=>{
    var postId=req.params.id;
    var results = await getPosts({ _id: postId });
    results=results[0];
    res.status(200).send(results);
})

router.post("/", async(req,res,next)=>{
    if(!req.body.content){
        console.log("El dato recibido no contiene nada.");
        return res.sendStatus(400);
    }

    var postData={
        content:req.body.content,
        postedBy:req.session.user
    }

    if(req.body.replyTo){
        postData.replyTo = req.body.replyTo;
    }

    Post.create(postData)
    .then(async newPost=>{
        newPost=await User.populate(newPost,{path:"postedBy"})
        res.status(201).send(newPost);
    })
    .catch(err=>{
        console.log(err);
        res.sendStatus(400);
    })
   
})

router.put("/:id/like",async(req,res,next)=>{
    var postId=req.params.id;
    var userId=req.session.user._id;

    var isLiked=req.session.user.likes && req.session.user.likes.includes(postId);

    var option=isLiked?"$pull":"$addToSet";

    req.session.user=await User.findByIdAndUpdate(userId,{[option]:{likes:postId}},{new:true})
    var post=await Post.findByIdAndUpdate(postId,{[option]:{likes:userId}},{new:true})

    res.status(200).send(post);
})


router.post("/:id/retweet",async(req,res,next)=>{

    var postId=req.params.id;
    var userId=req.session.user._id;

    var deletedPost=await Post.findOneAndDelete({postedBy:userId,retweetData:postId})

    var option=deletedPost!=null?"$pull":"$addToSet";

    var repost=deletedPost;
    if (repost ==null){
        repost=await Post.create({postedBy:userId,retweetData:postId})
    }

    req.session.user=await User.findByIdAndUpdate(userId,{[option]:{retweets:repost._id}},{new:true})
    var post=await Post.findByIdAndUpdate(postId,{[option]:{retweetUsers:userId}},{new:true})

    res.status(200).send(post);
})

async function getPosts(filter){
    var results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .sort({"createdAt":-1})
    .populate("replyTo")
    .catch(error=>console.log(error))
    
    results=await User.populate(results,{path:"replyTo.postedBy"});
    return results=await User.populate(results,{path:"retweetData.postedBy"});
}

module.exports=router;