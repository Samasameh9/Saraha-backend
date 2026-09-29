import jwt from "jsonwebtoken";
import {
  ACCESS_ADMIN_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIREIN,
  ACCESS_USER_TOKEN_SIGNATURE,
  REFRESH_ADMIN_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIREIN,
  REFRESH_USER_TOKEN_SIGNATURE,
} from "../../config.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../exception/error.exception.js";
import { findById, findOne } from "../repository/base.repository.js";
import { UserModel } from "../../DB/model/user.model.js";
import { tokenTypeEnum } from "../enum/security.enum.js";
import { roleEnum } from "../enum/user.enum.js";
import { compare } from "bcrypt";
import { decryption } from "./encryption.security.js";
import { randomUUID } from "node:crypto";
import { exists, set } from "../services/index.js";


export const userBaseKey =  ({ userId }) => {
  return `User::${userId.toString()}`;
};

export const userBaseRevokeTokenKey =  ({ userId }) => {
  return `${userBaseKey({userId})}::revokeToken`;
};

export const userRevokeTokenKey =  ({ userId, jti }) => {
  return `${userBaseRevokeTokenKey({userId})}::${jti}`;
};

export const createToken = async ({
  payload = {},
  options = {},
  secret = ACCESS_USER_TOKEN_SIGNATURE,
} = {}) => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = async ({
  token = "",
  secret = ACCESS_USER_TOKEN_SIGNATURE,
} = {}) => {
  return jwt.verify(token, secret);
};

const getTokenSignature = async ({ role = roleEnum.USER } = {}) => {
  let signatures;
  switch (role) {
    case roleEnum.ADMIN:
      signatures = {
        accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE,
        refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE,
      };
      break;

    default:
      signatures = {
        accessSignature: ACCESS_USER_TOKEN_SIGNATURE,
        refreshSignature: REFRESH_USER_TOKEN_SIGNATURE,
      };

      break;
  }

  return signatures;
};

const getSignature = async ({
  tokenType = tokenTypeEnum.ACCESS,
  role = roleEnum.USER,
} = {}) => {
  const signatures = await getTokenSignature({ role });
  return tokenType == tokenTypeEnum.ACCESS
    ? signatures.accessSignature
    : signatures.refreshSignature;
};

export const decodeToken = async ({
  authorization = "",
  tokenType = tokenTypeEnum.ACCESS,
} = {}) => {
  const decoded = jwt.decode(authorization);
  console.log(decoded);

  if (!decoded?.aud?.length) {
    throw BadRequestException({ messsage: "missing token payload" });
  }

  const payload = await verifyToken({
    token: authorization,
    secret: await getSignature({ tokenType, role: decoded.aud[0] }),
  });
  if (!payload?.sub) {
    throw BadRequestException({ message: "missing token payload" });
  }
  if (await exists({key: userRevokeTokenKey({ userId: payload.sub, jti: payload.jti })})) {
    throw UnauthorizedException({ message: "expired login credentials" });
  }
  const user = await findById({ model: UserModel, id: payload.sub });
  if (!user) {
    throw NotFoundException({ message: "invalid user" });
  }
  if((user.changeCredentialsTime?.getTime() ?? 0 )> payload.iat * 1000){
    throw UnauthorizedException({ message: "expired login credentials" });

  }
  return { user, payload };
};

export const createLoginCredentials = async ({
  user,
  options = {},
  issuer,
}) => {
  console.log(user.role);
  console.log(issuer);
  const jwtid = randomUUID();
  const { accessSignature, refreshSignature } = await getTokenSignature({
    role: user.role,
  });
  const access_token = await createToken({
    payload: { sub: user._id },
    secret: accessSignature,
    options: {
      ...options,
      issuer,
      audience: [user.role],
      expiresIn: ACCESS_TOKEN_EXPIREIN,
      jwtid,
    },
  });
  const refresh_token = await createToken({
    payload: { sub: user._id },
    secret: refreshSignature,
    options: {
      ...options,
      issuer,
      audience: [user?.role],
      expiresIn: REFRESH_TOKEN_EXPIREIN,
      jwtid,
    },
  });
  console.log({ access_token, refresh_token });

  return { access_token, refresh_token };
};

export const createRevokeToken = async ({ payload }) => {
  const consumedTime = (Math.ceil(Date.now() / 1000)) - payload?.iat;
  const refreshExpiresIn = payload?.iat + REFRESH_TOKEN_EXPIREIN;
  const ttl = refreshExpiresIn - consumedTime;
  console.log({ consumedTime, refreshExpiresIn, ttl });
  console.log(userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }));
  
  await set({
    key: userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }),
    value: payload.jti,
    ttl,
  });
  return;
};

export const basicAuth = async ({ email, password }) => {
  const account = await findOne({ model: UserModel, filter: { email } });
  if (!account) {
    throw NotFoundException({ message: "Invalid email or password" });
  }
  const match = await compare(password, account.password);
  if (!match) {
    throw NotFoundException({ message: "Invalid email or password" });
  }
  account.phone = await decryption(account.phone);

  return account;
};
