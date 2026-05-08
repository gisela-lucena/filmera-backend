import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import swipeRouter from "./routes/swipeRoutes.js";
import userRouter from "./routes/userRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
// import auth from "./middleware/auth.js";

const app = express();

app.use(express.json());

app.use("/swipes", auth, swipeRouter);
app.use("/users", auth, userRouter);
app.use("/rooms", auth, roomRouter);

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
