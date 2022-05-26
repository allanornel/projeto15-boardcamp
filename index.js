import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import categoryRouter from "./routes/categoryRouter.js";
import gameRouter from "./routes/gameRouter.js";
import customerRouter from "./routes/customerRouter.js";
import rentalRouter from "./routes/rentalRouter.js";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

app.use(categoryRouter);
app.use(gameRouter);
app.use(customerRouter);
app.use(rentalRouter);

app.listen(process.env.PORT, () =>
  console.log("Server ON port " + process.env.PORT)
);
