//CRUD


var MongoClient = require('mongodb').MongoClient


MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser:true},{ useUnifiedTopology: true },
function(err, client) {
  if(!err) {
   
   client.db('Task-manager').collection('users').findOne({name:'abhi'}
   ,(error,result)=>{
    if(error){
      return console.log('Unable to do task')
    }
    console.log(result._id)
   })
  }
});

//mongod --dbpath=/data