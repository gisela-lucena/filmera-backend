import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "Email invalido",
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    select: false,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
