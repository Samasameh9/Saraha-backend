import jwt from "jsonwebtoken"
import { UserModel } from "../../DB/model/user.model.js"
import { findById, findByIdAndUpdate } from "../../common/repository/base.repository.js"
import { createLoginCredentials, verifyToken } from "../../common/security/token.security.js"
import { ACCESS_TOKEN_EXPIREIN } from "../../config.js"
import { ConflictException } from "../../common/exception/error.exception.js"

export const profile=async (account)=>{
return account
}


export const update=async (user,data)=>{
const account=await findByIdAndUpdate({model:UserModel,update:data,id:user._id})
return account
}


export const rotateToken=async (payload,user,issuer)=>{
    const accessExpiresIn=(payload.iat + ACCESS_TOKEN_EXPIREIN) * 1000
    const currentTime= Date.now() +(30 * 60000)
    if(currentTime < accessExpiresIn){
        throw ConflictException({message:"sorry we cannot create new login now"})
    }
     return await createLoginCredentials({user,issuer})
    

}