import mongoose from "mongoose";
import validator from "validator";

const leadSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email address",
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Lead", leadSchema);
