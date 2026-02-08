import { Router } from "express";
import * as ctrl from "../controllers/artists.controller.js";
import { upload } from "../middleware/upload.js";

export const artistsRouter = Router();

artistsRouter.get("/", ctrl.getAll);
artistsRouter.get("/:id", ctrl.getById);
artistsRouter.get("/:id/songs", ctrl.getArtistSongs);
artistsRouter.post("/", upload.single("photo"), ctrl.create);
artistsRouter.put("/:id", upload.single("photo"), ctrl.update);
artistsRouter.delete("/:id", ctrl.remove);
