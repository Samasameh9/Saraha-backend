import { UserModel } from "../../DB/model/user.model.js";
import { findByIdAndUpdate } from "../../common/repository/base.repository.js";
import {
  createLoginCredentials,
  createRevokeToken,
  userBaseKey,
  userBaseRevokeTokenKey,
} from "../../common/security/token.security.js";
import { ACCESS_TOKEN_EXPIREIN, REFRESH_TOKEN_EXPIREIN } from "../../config.js";
import { ConflictException } from "../../common/exception/error.exception.js";
import { del, keys, set } from "../../common/services/index.js";
import { logoutEnum } from "../../common/enum/security.enum.js";


export const clearProfileCache = async (userId) => {
  return await del({key: userBaseKey({ userId })});
};

export const profile = async (account) => {
  await set({key:userBaseKey({userId:account._id}),value:account,ttl:300})
  return account;
};

export const update = async (user, data) => {
  const account = await findByIdAndUpdate({
    model: UserModel,
    update: data,
    id: user._id,
  });
  await clearProfileCache(user._id)
  return account;
};

export const rotateToken = async (payload, user, issuer) => {
  const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIREIN) * 1000;
  const currentTime = Date.now() + 30 * 60000;
  if (currentTime < accessExpiresIn) {
    throw ConflictException({
      message: "sorry we cannot create new login now",
    });
  }
  const data = await createLoginCredentials({ user, issuer });
  await createRevokeToken({ payload });
  return data;
};

export const logout = async (payload, user, { action = logoutEnum.DEVICE }) => {
  switch (action) {
    case logoutEnum.ALL:
      user.changeCredentialsTime = new Date();
      await user.save();
      console.log({
        k: await keys({
          prefix: userBaseRevokeTokenKey({
            userId: payload.sub,
          }),
        }),
      });
      await del({
        key: await keys({
          prefix: userBaseRevokeTokenKey({
            userId: payload.sub,
          }),
        }),
      });

      break;

    default:
      await createRevokeToken({ payload });
      break;
  }

  return;
};
