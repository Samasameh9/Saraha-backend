import { languageEnum } from "../common/enum/security.enum.js";
import { BadRequestException } from "../common/exception/error.exception.js";

export const validation = (schema) => {
  return (req, res, next) => {
    const lang=Number(req.headers['accept-language'] ?? languageEnum.EN)
    const validationResult = schema(lang).safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!validationResult.success) {
      throw BadRequestException({
        message: "validation Error",
        extra: validationResult.error.issues,
      });
    }
    req.validate = validationResult.data;
    next();
  };
};
