const mongoose= require('mongoose')

mongoose.connect(process.env.MONGOOSE_CONNECTION,{
    useNewUrlParser:true,
    useCreateIndex:true
});