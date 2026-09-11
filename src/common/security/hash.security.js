import bcrypt from "bcrypt";
import argon2 from 'argon2'

export const hash = async ({
  plaintext,
  round = 12,
  minor = "b",
  approach = "bcrypt",
} = {}) => {
    let ciphertext=''
  switch (approach) {
    case "bcrypt":
      const salt = (await bcrypt.genSalt(round, minor)).toString();
      ciphertext= await bcrypt.hash(plaintext, salt);
      break;
       case "argon2":
      ciphertext= await argon2.hash(plaintext);
      break;

    default:
      break;
  }
  return ciphertext
};

export const compare = async (plaintext, ciphertext,approach = "bcrypt") => {
    let match=''
  switch (approach) {
    case "bcrypt":
        match= await bcrypt.compare(plaintext, ciphertext);
      break;
       case "argon2":
     match= await argon2.verify(ciphertext,plaintext);
      break;

    default:
      break;
  }
  return match


};
