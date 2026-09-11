import {
  ConflictException,
  NotFoundException,
} from "../../common/exception/error.exception.js";
import { create, findOne } from "../../common/repository/index.js";
import { compare, decryption, encryption, hash } from "../../common/security/index.js";
import { UserModel } from "../../DB/model/user.model.js";

export const signup = async ({ userName, email, password, gender,phone }) => {
  const checkExist = await findOne({ model: UserModel, filter: { email } });
  if (checkExist) {
    throw ConflictException({message:"Email exists"});
  }
  const user = await create({
    model: UserModel,
    data: { userName, email, password:await hash({plaintext:password}), gender,phone:await encryption(phone) },
  });
  return user;

};

export const login = async ({ email, password }) => {
  const account = await findOne({ model: UserModel, filter: { email} });
  if (!account) {
    throw NotFoundException({message:"Invalid email or password"});
  }
  const match=await compare(password,account.password)
  if(!match){
     throw NotFoundException({message:"Invalid email or password"});
  }
  account.phone=await decryption(account.phone)
  return account;
};
