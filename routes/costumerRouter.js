import { Router } from "express";
import {
  getCostumers,
  getCostumersId,
  postCostumers,
  updateCostumers,
} from "../controllers/costumerController.js";

const costumerRouter = Router();

costumerRouter.get("/costumers", getCostumers);
costumerRouter.post("/costumers/:id", getCostumersId);
costumerRouter.post("/costumers", postCostumers);
costumerRouter.put("/costumers/:id", updateCostumers);

export default costumerRouter;
