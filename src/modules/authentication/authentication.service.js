import { providerEnum } from "../../common/enum/user.enum.js";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  TooManyRequestException,
} from "../../common/exception/error.exception.js";
import { create, findOne } from "../../common/repository/index.js";
import {
  compare,
  createLoginCredentials,
  decryption,
  encryption,
  hash,
  userBaseRevokeTokenKey,
  userEmailBaseKey,
} from "../../common/security/index.js";
import { WEB_CLIENT_IDS } from "../../config.js";
import { UserModel } from "../../DB/model/user.model.js";
import { OAuth2Client } from "google-auth-library";
import { emailEvent } from "./../../common/events/email.event.js";
import { emailSubjectEnum } from "../../common/enum/email.enum.js";
import { createNumberOtp } from "../../common/utils/email/otp.js";
import {
  del,
  expire,
  get,
  incrBy,
  keys,
  set,
  ttl,
} from "../../common/services/cash.service.js";
import {
  userEmailKey,
  userEmailOtpTrialsKey,
} from "../../common/utils/index.js";

const client = new OAuth2Client();
async function verifyGoogleAccount(idToken) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: WEB_CLIENT_IDS,
  });
  const payload = ticket.getPayload();
  if (!payload.email_verified) {
    throw BadRequestException({ message: "email not verified" });
  }
  return payload;
}

export const signupWithGmail = async ({ idToken }, issuer) => {
  const { email, name, picture } = await verifyGoogleAccount(idToken);
  console.log({ email, name, picture });
  const existAccount = await findOne({ model: UserModel, filter: { email } });
  if (existAccount) {
    if (existAccount.provider != providerEnum.GOOGLE) {
      throw ConflictException({ message: "invalid account provider" });
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

const sendEmailOtp = async ({
  email,
  subject = emailSubjectEnum.CONFIRM_EMAIL,
  expiresIn = 120,
  maxTrials = 3,
  blockSeconds = 300,
}) => {
  const existOtpTtl = await ttl({ key: userEmailKey({ email, subject }) });
  if (existOtpTtl > 0) {
    throw ConflictException({
      message: `sorry we cannot request new otp while existing one is valid try again in ${existOtpTtl}s`,
    });
  }
  let currentTrials =
    (await get({ key: userEmailOtpTrialsKey({ email, subject }) })) ?? 0;
  if (currentTrials >= maxTrials) {
    throw TooManyRequestException({ message: `we have reached otp limit` });
  }
  const otp = createNumberOtp();
  await set({
    key: userEmailKey({ email, subject }),
    value: await hash({ plaintext: otp.toString() }),
    ttl: expiresIn,
  });

  const finalTrials = await incrBy({
    key: userEmailOtpTrialsKey({ email, subject }),
  });

  if (finalTrials == 3) {
    await expire({
      key: userEmailOtpTrialsKey({ email, subject }),
      ttl: blockSeconds,
    });
  }

  emailEvent.emit("sendEmail", {
    recipent: { to: email },
    subject,
    data: { code: otp },
  });
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
  await sendEmailOtp({ email, subject: emailSubjectEnum.CONFIRM_EMAIL });
  return user;
};

export const confirmEmail = async ({ email, otp }) => {
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.SYSTEM,
      confirmEmail: { $exists: false },
    },
  });
  if (!account) {
    throw NotFoundException({ message: "invalid acccount" });
  }
  const hashOtp = await get({
    key: userEmailKey({ email, subject: emailSubjectEnum.CONFIRM_EMAIL }),
  });
  if (!hashOtp || !(await compare(otp, hashOtp))) {
    throw BadRequestException({ message: "invalid otp" });
  }
  account.confirmEmail = new Date();
  await account.save();
  await del({
    key: await keys({
      prefix: userEmailKey({ email, subject: emailSubjectEnum.CONFIRM_EMAIL }),
    }),
  });
  return;
};

export const resendConfirmEmail = async ({ email }) => {
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.SYSTEM,
      confirmEmail: { $exists: false },
    },
  });
  if (!account) {
    throw NotFoundException({ message: "invalid acccount" });
  }
  await sendEmailOtp({ email, subject: emailSubjectEnum.CONFIRM_EMAIL });
  return;
};

export const requestForgotPassword = async ({ email }) => {
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });
  if (!account) {
    throw NotFoundException({ message: "invalid acccount" });
  }
  await sendEmailOtp({ email, subject: emailSubjectEnum.FORGOT_PASSWORD });
  return;
};

export const verifyForgotPassword = async ({ email, otp }) => {
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });
  if (!account) {
    throw NotFoundException({ message: "invalid acccount" });
  }
  const hashOtp = await get({
    key: userEmailKey({ email, subject: emailSubjectEnum.FORGOT_PASSWORD }),
  });
  if (!hashOtp || !(await compare(otp, hashOtp))) {
    throw BadRequestException({ message: "invalid otp" });
  }
  return account;
};

export const resetForgotPassword = async ({ email, otp, password }) => {
  const account = await verifyForgotPassword({ email, otp });
  account.password = await hash({ plaintext: password });
  account.changeCredentialsTime = new Date();
  await account.save();
  const result = await Promise.all([
    keys({
      prefix: userEmailKey({
        email,
        subject: emailSubjectEnum.FORGOT_PASSWORD,
      }),
    }),
    keys({ prefix: userBaseRevokeTokenKey({ userId: account._id }) }),
  ]);
  await del({ key: [...result[0], ...result[1]] });

  return;
};

export const enableTwoStepVerification = async ({ email }) => {
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.SYSTEM,
      twoStepVerification: false,
    },
  });
  if (!account) {
    throw NotFoundException({ message: "invalid acccount" });
  }
  if (account.twoStepVerification) {
    throw ConflictException({
      message: "Two-step verification is already enabled",
    });
  }
  await sendEmailOtp({
    email,
    subject: emailSubjectEnum.TWO_STEP_VERIFICATION,
  });
  return;
};

export const verifyTwoStepVerification = async ({ email, otp }) => {
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });

  if (!account) {
    throw NotFoundException({
      message: "Invalid account",
    });
  }

  if (account.twoStepVerification) {
    throw ConflictException({
      message: "Two-step verification is already enabled",
    });
  }

  const hashOtp = await get({
    key: userEmailKey({
      email,
      subject: emailSubjectEnum.TWO_STEP_VERIFICATION,
    }),
  });

  if (!hashOtp || !(await compare(otp, hashOtp))) {
    throw BadRequestException({
      message: "Invalid OTP",
    });
  }

  account.twoStepVerification = true;

  await account.save();

  await del({
    key: userEmailKey({
      email,
      subject: emailSubjectEnum.TWO_STEP_VERIFICATION,
    }),
  });

  return {
    message: "Two-step verification enabled successfully",
  };
};

export const confirmLogin = async ({ email, otp }, issuer) => {
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.SYSTEM,
      confirmEmail: { $exists: true },
      twoStepVerification: true,
    },
  });
  if (!account) {
    throw NotFoundException({
      message: "Invalid account",
    });
  }
  const otpKey = userEmailKey({
    email,
    subject: emailSubjectEnum.TWO_STEP_VERIFICATION,
  });
  const hashOtp = await get({
    key: otpKey,
  });
  if (!hashOtp || !(await compare(otp, hashOtp))) {
    throw BadRequestException({
      message: "Invalid OTP",
    });
  }
  await del({
    key: otpKey,
  });
  account.phone = await decryption(account.phone);
  return await createLoginCredentials({
    user: account,
    issuer,
  });
};

export const login = async ({ email, password }, issuer) => {
  const attemptsKey = userEmailBaseKey({ email });
  const blockUser = async () => {
    const trials = await incrBy({ key: attemptsKey });
    if (trials >= 5) {
      await expire({ key: attemptsKey, ttl: 300 });
      throw ForbiddenException({
        message: "Account blocked try after 5 minutes",
      });
    }
  };
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });
  const currentTrials = await get({ key: attemptsKey });
  if (Number(currentTrials) >= 5) {
    throw ForbiddenException({
      message: "Account temporarily blocked. Try again after 5 minutes",
    });
  }
  if (!account) {
    await blockUser();
    throw NotFoundException({ message: "Invalid email or password" });
  }
  const match = await compare(password, account.password);
  if (!match) {
    await blockUser();
    throw NotFoundException({ message: "Invalid email or password" });
  }
  await del({ key: attemptsKey });
  if (account.twoStepVerification) {
    await sendEmailOtp({
      email,
      subject: emailSubjectEnum.TWO_STEP_VERIFICATION,
    });

    return {
      twoStepRequired: true,
    };
  }
  account.phone = await decryption(account.phone);

  return await createLoginCredentials({ user: account, issuer });
};
