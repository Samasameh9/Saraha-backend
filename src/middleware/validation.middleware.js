import { BadRequestException } from "../common/exception/error.exception.js";

export const validation=(schema)=>{
    return (req,res,next)=>{
const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        throw BadRequestException({
          message: "validation Error",
          extra: validationResult.error.issues,
        });
      }
      req.validate=validationResult.data
      next()
    } 
}