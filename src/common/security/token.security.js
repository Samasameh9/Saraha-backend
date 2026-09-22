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
} from "../exception/error.exception.js";
import { findById, findOne } from "../repository/base.repository.js";
import { UserModel } from "../../DB/model/user.model.js";
import { tokenTypeEnum } from "../enum/security.enum.js";
import { roleEnum } from "../enum/user.enum.js";
import { compare } from "bcrypt";
import { decryption } from "./encryption.security.js";

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
    throw BadRequestException("missing token payload");
  }

  const payload = await verifyToken({
    token: authorization,
    secret: await getSignature({ tokenType, role: decoded.aud[0] }),
  });
  if (!payload?.sub) {
    throw BadRequestException("missing token payload");
  }
  const user = await findById({ model: UserModel, id: payload.sub });
  if (!user) {
    throw NotFoundException("invalid user");
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
    },
  });
  console.log({ access_token, refresh_token });

  return { access_token, refresh_token };
};


export const basicAuth= async ({ email, password }) => {
  const account = await findOne({ model: UserModel, filter: { email } });
  if (!account) {
    throw NotFoundException({ message: "Invalid email or password" });
  }
  const match = await compare(password, account.password);
  if (!match) {
    throw NotFoundException({ message: "Invalid email or password" });
  }
  account.phone = await decryption(account.phone);

 return account
}
