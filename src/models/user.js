const mongoose= require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('./task')

const userSchema=new mongoose.Schema(
    {
        tokens:[{
            token:{
                type:String,
                required:true
            }
        }],
        avatar:{
            type:Buffer
        },
        name:{
    type:String,
    required:true
    
        },
        email:{
            type:String,
            unique:true,
            required:true,
            validate(value){
                if(!validator.isEmail(value)){
                    throw new Error ('Email is invalid!')
                }
            }
        },
        age:{
    type:Number,
    default:0,
    validate(value){
        if(value<0){
            throw new Error
    ('Age must be positive number')    }
    }
        },
        password:{
            type:String,
            required:true,
            minlength:7,
            trim:true
        }
        
    },{
        timestamps:true
    }
)
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})



userSchema.pre('save',async function(next) {

    const user=this

if(user.isModified('password')){
    user.password=await bcrypt.hash(user.password,8)
}
next()
})
//delete user tasks when user is removed
userSchema.pre('remove',async function(next){
    const user=this
Task.deleteMany({owner:user._id})
    next()
})


userSchema.methods.generateAuthToken=async function() { 
const user=this
const token=jwt.sign({_id:user._id.toString()},process.env.JWT_KEY_USER)
user.tokens=user.tokens.concat({token})
await user.save()
return token
}
userSchema.methods.toJSON=function(){
    const user= this
    const userObject=user.toObject()

    delete userObject.password   
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.statics.findByCredentials= async (email,password)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error ('unable to login connect email ')
    }
    const isMatch=await  bcrypt.compare(password,user.password)
    if(!isMatch) {
        throw new Error('unable to login')
    }
    return user
}
const User=mongoose.model('User',userSchema)


module.exports=User