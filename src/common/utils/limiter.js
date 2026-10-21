import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import geoip from "geoip-lite";
import { client } from "../../DB/redis.connection.js";
import { successResponse } from "./success.response.js";

function fromWhere(ip) {
  try {
    return geoip.lookup(ip);
  } catch (error) {
    console.log(error);
  }
}

export const generateLimiter = ({
  ttl=15,
  message = "too many requests",
  status = 429,
  standardHeaders = "draft-8",
  legacyHeaders=true,
  skipSuccessfulRequests ,
  skipFailedRequests,
  limit=1000
}={}) => {
  return rateLimit({
    windowMs: ttl * 60 * 1000,
    limit: function (req) {
      const data = fromWhere(req.ip);
      return data?.country == "EG" ? limit : 500;
    },
    
    standardHeaders,
    legacyHeaders,
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: function (req, res, next) {
      return successResponse({ res, message, status });
    },
    keyGenerator: function (req) {
      const ip = ipKeyGenerator(req.ip, 52);
      return `${ip}::${req.path}`;
    },
    store: {
      async incr(key, cb) {
        try {
         
          const count = await client.incr(key);

          if (count === 1) {
            await client.expire(key, ttl * 60);
          }

          cb(null, count);
        } catch (error) {
          console.error("Redis incr error:", error);
          cb(error);
        }
      },

      async decrement(key) {
        try {
          if (await client.exists(key)) {
            await clientt.decr(key);
          }
        } catch (error) {
          console.error("Redis decrement error:", error);
          throw error;
        }
      },
    },
  });
};
