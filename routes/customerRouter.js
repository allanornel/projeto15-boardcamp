import { Router } from "express";
import {
  getCustomers,
  getCustomersId,
  postCustomers,
  updateCustomers,
} from "../controllers/customerController.js";
import { postCustomerSchema } from "../schemas/costumerSchema.js";

const customerRouter = Router();

customerRouter.get("/customers", getCustomers);
customerRouter.get("/customers/:id", getCustomersId);
customerRouter.post("/customers", postCustomerSchema, postCustomers);
customerRouter.put("/customers/:id", postCustomerSchema, updateCustomers);

export default customerRouter;
