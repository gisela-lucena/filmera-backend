import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      message: "Usuário criado com sucesso",
      user: { email: user.email, _id: user._id },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }
    next(err);
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "dev-secret",

      { expiresIn: "7d" },
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).orFail();
    return res.json(user);
  } catch (err) {
    next(err);
  }
};

export const patchUser = async (req, res, next) => {
  try {
    const { name } = req.body;
    const currentUserId = req.user._id;

    const user = await User.findByIdAndUpdate(
      currentUserId,
      { name },
      { new: true, runValidators: true },
    ).orFail();

    res.json(user);
  } catch (err) {
    next(err);
  }
};
