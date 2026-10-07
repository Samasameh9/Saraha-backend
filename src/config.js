import {config} from "dotenv"
export const NODE_ENV=process.env.NODE_ENV??"development"
config({path:`.env.${NODE_ENV}`})
console.log({PORT:process.env.PORT});

export const port=parseInt(process.env.PORT??"9000")

// data base
export const DB_URI=process.env.DB_URI
export const REDIS_URI=process.env.REDIS_URI
export const ENC_KEY=process.env.ENC_KEY
export const IV_LENGTH=parseInt(process.env.IV_LENGTH?? "16")

// access token
export const ACCESS_USER_TOKEN_SIGNATURE=process.env.ACCESS_USER_TOKEN_SIGNATURE
export const ACCESS_ADMIN_TOKEN_SIGNATURE=process.env.ACCESS_ADMIN_TOKEN_SIGNATURE
export const ACCESS_TOKEN_EXPIREIN=parseInt(process.env.ACCESS_TOKEN_EXPIREIN?? "1800")

// refresh token
export const REFRESH_ADMIN_TOKEN_SIGNATURE=process.env.REFRESH_ADMIN_TOKEN_SIGNATURE
export const REFRESH_USER_TOKEN_SIGNATURE=process.env.REFRESH_USER_TOKEN_SIGNATURE
export const REFRESH_TOKEN_EXPIREIN=parseInt(process.env.REFRESH_USER_TOKEN_EXPIREIN?? "31536000")

// signup with gmail
export const WEB_CLIENT_IDS=process.env.WEB_CLIENT_IDS.split(",")

// send email
export const APP_PASSWORD=process.env.APP_PASSWORD
export const APP_EMAIL=process.env.APP_EMAIL





