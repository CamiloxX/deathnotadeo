const mongoose=require("mongoose");

/*
mongoose.set('useNewUrlParser',true)
mongoose.set('useUnifiedTopology',true)
mongoose.set('useFindAndModify',false)
mongoose.set('useUnifiedTopology',true)
*/

class Database{
    constructor(){
        this.connect();
    }
    connect(){
        mongoose.connect('mongodb+srv://john:Johnesgenial-7@clondetwittercluster.xkq73yz.mongodb.net/?retryWrites=true&w=majority&appName=clondetwittercluster')
        .then(()=>{
            console.log("Conectado a la Base de Datos")
        })
        .catch((err)=>{
            console.log("Error: "+err)
        })
    }
}

module.exports=new Database();
