import mongoose from "mongoose"
import { DB_URI } from "../config.js"
import { UserModel } from "./model/user.model.js"

export const bootstrapDB=async (app,port)=>{
    try {
        await mongoose.connect(DB_URI,{serverSelectionTimeoutMS:3000})
        await UserModel.syncIndexes()
        console.log(`DB is connected successfully`);
        app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
    } catch (error) {
        console.log(error);
        console.log(`DB failed to connect`);
        
        
    }
}