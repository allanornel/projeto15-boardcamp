import { Router } from "express";
import {
  deleteRental,
  finalRental,
  getRentals,
  postRentals,
} from "../controllers/rentalController.js";

const rentalRouter = Router();

rentalRouter.get("/rentals", getRentals);
rentalRouter.post("/rentals", postRentals);
rentalRouter.post("/rentals/:id/return", finalRental);
rentalRouter.delete("/rentals/:id", deleteRental);

export default rentalRouter;
