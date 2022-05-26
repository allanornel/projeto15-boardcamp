import { Router } from "express";
import {
  getCategories,
  postCategories,
} from "../controllers/categoryController.js";
import { postCategorySchema } from "../schemas/categorySchema.js";

const categoryRouter = Router();

categoryRouter.get("/categories", getCategories);
categoryRouter.post("/categories", postCategorySchema, postCategories);

export default categoryRouter;
