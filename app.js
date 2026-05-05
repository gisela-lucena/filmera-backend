import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();

app.use(express.json());
const PORT = 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Conectado ao MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB", err);
    process.exit(1);
  });

export default app;
