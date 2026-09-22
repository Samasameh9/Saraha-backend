import { providerEnum } from "../../common/enum/user.enum.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/exception/error.exception.js";
import { create, findOne } from "../../common/repository/index.js";
import {
  compare,
  createLoginCredentials,
  createToken,
  decryption,
  encryption,
  hash,
} from "../../common/security/index.js";
import { WEB_CLIENT_IDS } from "../../config.js";
import { UserModel } from "../../DB/model/user.model.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();
async function verifyGoogleAccount(idToken) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: WEB_CLIENT_IDS,
  });
  const payload = ticket.getPayload();
  if (!payload.email_verified) {
    throw BadRequestException({message:"email not verified"});
  }
  return payload;
}

export const signupWithGmail = async ({ idToken }, issuer) => {
  const { email, name, picture } = await verifyGoogleAccount(idToken);
  console.log({ email, name, picture });
  const existAccount = await findOne({ model: UserModel, filter: { email } });
  if (existAccount) {
    if (existAccount.provider != providerEnum.GOOGLE) {
      throw ConflictException({message:"invalid account provider"});
    }
    return {
      status: 200,
      data: await createLoginCredentials({ user: existAccount, issuer }),
    };
  }
  const user = await create({
    model: UserModel,
    data: {
      email,
      userName: name,
      confirmEmail: new Date(),
      provider: providerEnum.GOOGLE,
      image: picture,
    },
  });
  return { status: 201, data: await createLoginCredentials({ user, issuer }) };
};

export const signup = async ({ userName, email, password, gender, phone }) => {
  const checkExist = await findOne({ model: UserModel, filter: { email } });
  if (checkExist) {
    throw ConflictException({ message: "Email exists" });
  }
  const user = await create({
    model: UserModel,
    data: {
      userName,
      email,
      password: await hash({ plaintext: password }),
      gender,
      phone: await encryption(phone),
    },
  });
  return user;
};

export const login = async ({ email, password }, issuer) => {
  const account = await findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.SYSTEM },
  });
  if (!account) {
    throw NotFoundException({ message: "Invalid email or password" });
  }
  const match = await compare(password, account.password);
  if (!match) {
    throw NotFoundException({ message: "Invalid email or password" });
  }
  account.phone = await decryption(account.phone);

  return await createLoginCredentials({ user: account, issuer });
};
