const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const userschema=new Schema({
    firstName:{type:String,required:true,trim:true},
    lastName:{type:String,required:true,trim:true},
    username:{type:String,required:true,trim:true,unique:true},
    email:{type:String,required:true,trim:true,unique:true},
    password:{type:String,required:true,trim:true},
    profilePic:{type:String,default:"/images/profilePic.png"},
    likes:[{type:Schema.Types.ObjectId,ref:'Post'}],
    retweets:[{type:Schema.Types.ObjectId,ref:'Post'}]
},{timestamps:true});

var User = mongoose.model('User',userschema);
module.exports=User;