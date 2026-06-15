import { Router } from "express";
import { celebrate, Joi } from "celebrate";
import { createLead } from "../controllers/leads.js";

const leadsRouter = Router();

const validateCreateLead = celebrate({
  body: Joi.object().keys({
    email: Joi.string().trim().lowercase().email().required(),
  }),
});

leadsRouter.post("/", validateCreateLead, createLead);

export default leadsRouter;
