import mongoose from "mongoose";
import { genderEnum } from "../../common/enum/index.js";
const userSchema =new mongoose.Schema(
  {
    firstName: { type: String, minLength: 3, maxLength: 15, required: true },
    lastName: { type: String, minLength: 3, maxLength: 15, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    DOB: { type: Date },
    image: String,
    coverImage: [String],
    confirmEmail:{type:Boolean,default:false},
    phone:String,
    gender:{type:Number,Enum:Object.values(genderEnum),default:genderEnum.Male}
  },
  {
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    strict:true,
    strictQuery:true
  },
);

userSchema.virtual("userName").set(function(values){
const [firstName,lastName]=values?.split(" ")|| []
 this.set({ firstName, lastName });
}).get(function(){
    return this.firstName +" "+ this.lastName
})

export const UserModel=mongoose.models.user||mongoose.model("user",userSchema)