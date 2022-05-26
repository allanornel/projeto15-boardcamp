import { Router } from "express";
import {
  deleteRental,
  finalRental,
  getRentals,
  postRentals,
} from "../controllers/rentalController.js";
import { postRentalSchema } from "../schemas/rentalSchema.js";

const rentalRouter = Router();

rentalRouter.get("/rentals", getRentals);
rentalRouter.post("/rentals", postRentalSchema, postRentals);
rentalRouter.post("/rentals/:id/return", finalRental);
rentalRouter.delete("/rentals/:id", deleteRental);

export default rentalRouter;
