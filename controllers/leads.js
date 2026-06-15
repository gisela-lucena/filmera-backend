import Lead from "../models/lead.js";

const SUCCESS_RESPONSE = {
  message: "You're on the list. We'll let you know when Filmera launches.",
};

export const createLead = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    await Lead.create({ email });

    return res.status(201).json(SUCCESS_RESPONSE);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    return next(err);
  }
};
