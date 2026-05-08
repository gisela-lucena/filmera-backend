import validator from "validator";
import { Joi } from "celebrate";

export const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
};
