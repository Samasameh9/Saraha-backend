import {Router} from "express"
import { successResponse } from "../../common/utils/index.js"
import { profile, rotateToken, update } from "./user.service.js"
import { authentication, authorization } from "../../middleware/index.js"
import { tokenTypeEnum } from "../../common/enum/security.enum.js"
import { roleEnum } from "../../common/enum/user.enum.js"

const router=Router()

router.get("/",authentication(),async(req,res,next)=>{
   const data= await profile(req.user)
   return successResponse({res,data})
})

router.patch("/",authentication(),authorization(roleEnum.ADMIN),async(req,res,next)=>{
   const data= await update(req.user,req.body)
   return successResponse({res,data})
})

router.post("/rotate-token",authentication(tokenTypeEnum.REFRESH),async(req,res,next)=>{
   const data= await rotateToken(req.payload,req.user,`${req.protocol}://${req.host}`)
   return successResponse({res,data})
})

export default router