import {config} from "dotenv"
export const NODE_ENV=process.env.NODE_ENV??"development"
config({path:`.env.${NODE_ENV}`})
console.log({PORT:process.env.PORT});

export const port=parseInt(process.env.PORT??"9000")


export const DB_URI=process.env.DB_URI
export const ENC_KEY=process.env.ENC_KEY
export const IV_LENGTH=parseInt(process.env.IV_LENGTH?? "16")


export const ACCESS_USER_TOKEN_SIGNATURE=process.env.ACCESS_USER_TOKEN_SIGNATURE
export const ACCESS_ADMIN_TOKEN_SIGNATURE=process.env.ACCESS_ADMIN_TOKEN_SIGNATURE
export const ACCESS_TOKEN_EXPIREIN=parseInt(process.env.ACCESS_TOKEN_EXPIREIN?? "1800")


export const REFRESH_ADMIN_TOKEN_SIGNATURE=process.env.REFRESH_ADMIN_TOKEN_SIGNATURE
export const REFRESH_USER_TOKEN_SIGNATURE=process.env.REFRESH_USER_TOKEN_SIGNATURE
export const REFRESH_TOKEN_EXPIREIN=parseInt(process.env.REFRESH_USER_TOKEN_EXPIREIN?? "31536000")


export const WEB_CLIENT_IDS=process.env.WEB_CLIENT_IDS.split(",")




