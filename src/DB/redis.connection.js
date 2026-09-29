import { createClient } from "redis"
import { REDIS_URI } from "../config.js";

export const client = createClient({
  url: REDIS_URI
});


export async function connectionRedis(){
    try {
        await client.connect()
        console.log('redis connected successfully');
        
    } catch (error) {
        console.log('failed to connect redis');
        
    }
}
