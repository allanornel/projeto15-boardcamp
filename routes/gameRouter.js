import { Router } from "express";
import { getGames, postGames } from "../controllers/gameController.js";

const gameRouter = Router();

gameRouter.get("/games", getGames);
gameRouter.post("/games", postGames);

export default gameRouter;
