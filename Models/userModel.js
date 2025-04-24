import mongoose from "mongoose"

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
        trim: true,
        // parse:true
    },

    phone:{
        type:Number,
        required:false,
        // default:null
    },
    password:{
        type:String,
        required:true
    },
    googleId:{
        type:String,
        required: false,
        unique:false
    },

    isAdmin:{
        type:Boolean,
        default:false
    },

    isBlocked:{
        type:Boolean,
        default:false
    },
  
    address: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address' 
        }
    ]

},{timestamps: true})

export default mongoose.model('User', userSchema)    
