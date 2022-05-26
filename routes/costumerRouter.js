import { Router } from "express";
import {
  getCostumers,
  getCostumersId,
  postCostumers,
  updateCostumers,
} from "../controllers/costumerController.js";
import { postCostumerSchema } from "../schemas/costumerSchema.js";

const costumerRouter = Router();

costumerRouter.get("/costumers", getCostumers);
costumerRouter.get("/costumers/:id", getCostumersId);
costumerRouter.post("/costumers", postCostumerSchema, postCostumers);
costumerRouter.put("/costumers/:id", postCostumerSchema, updateCostumers);

export default costumerRouter;
