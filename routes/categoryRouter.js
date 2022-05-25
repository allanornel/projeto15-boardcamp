import { Router } from "express";
import {
  getCategories,
  postCategories,
} from "../controllers/categoryController.js";

const categoryRouter = Router();

categoryRouter.get("/categories", getCategories);
categoryRouter.post("/categories", postCategories);

export default categoryRouter;
