import {Router} from "express"
import { successResponse } from "../../common/utils/index.js"

const router=Router()

router.post("/",(req,res,next)=>{
   return successResponse({res,status:201})
})


export default router