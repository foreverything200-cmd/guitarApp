import { Router } from "express";
import * as ctrl from "../controllers/playlists.controller.js";

export const playlistsRouter = Router();

playlistsRouter.get("/", ctrl.getAll);
playlistsRouter.get("/:id", ctrl.getById);
playlistsRouter.post("/", ctrl.create);
playlistsRouter.put("/:id", ctrl.update);
playlistsRouter.delete("/:id", ctrl.remove);
playlistsRouter.post("/:id/songs", ctrl.addSong);
playlistsRouter.delete("/:id/songs/:songId", ctrl.removeSong);
playlistsRouter.put("/:id/reorder", ctrl.reorderSongs);
playlistsRouter.get("/:id/random", ctrl.getRandomSong);
