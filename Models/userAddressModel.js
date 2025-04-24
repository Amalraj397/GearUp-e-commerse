import mongoose from "mongoose";

const addressSchema=new mongoose.Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        firstName:{
            type:String,
            require:[true,'fname is required field']
        },
        lastName:{
            type:String,
            require:[true,'lname is required field']
        },
        addressData:[
            {
                address:{
                    type: String,
                },
                pincode:{
                    type: String,
                },
                city:{
                    type: String,
                },
                state:{
                    type: String,
                },
                country:{
                    type: String,
                },
                landmark:{
                    type:String,
                },
                altPhone:{
                    type:String,
                },
                isDefault:{
                    type: String,
                    default: false,
                },
            },
        ],
        addressType:{
            type:String,
            enum: ['Home','Office','Other'],
            default: 'Home'
        }
    })

    export default mongoose.model("Address", addressSchema);