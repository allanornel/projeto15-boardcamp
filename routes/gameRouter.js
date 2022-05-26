import { Router } from "express";
import { getGames, postGames } from "../controllers/gameController.js";
import { postGameSchema } from "../schemas/gameSchema.js";

const gameRouter = Router();

gameRouter.get("/games", getGames);
gameRouter.post("/games", postGameSchema, postGames);

export default gameRouter;
