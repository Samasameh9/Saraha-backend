import {config} from "dotenv"
export const NODE_ENV=process.env.NODE_ENV??"development"
config({path:`.env.${NODE_ENV}`})
console.log({PORT:process.env.PORT});

export const port=parseInt(process.env.PORT??"9000")


export const DB_URI=process.env.DB_URI
export const ENC_KEY=process.env.ENC_KEY
export const IV_LENGTH=parseInt(process.env.IV_LENGTH?? "16")
