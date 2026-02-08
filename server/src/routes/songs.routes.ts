import { Router } from "express";
import * as ctrl from "../controllers/songs.controller.js";
import { upload } from "../middleware/upload.js";

export const songsRouter = Router();

const songUpload = upload.fields([
  { name: "albumCover", maxCount: 1 },
  { name: "chordSheet", maxCount: 1 },
]);

songsRouter.get("/", ctrl.getAll);
songsRouter.get("/search", ctrl.search);
songsRouter.get("/random", ctrl.getRandom);
songsRouter.get("/known", ctrl.getKnownSongs);
songsRouter.get("/learning", ctrl.getLearningSongs);
songsRouter.get("/stats", ctrl.getStats);
songsRouter.get("/:id", ctrl.getById);
songsRouter.post("/", songUpload, ctrl.create);
songsRouter.put("/:id", songUpload, ctrl.update);
songsRouter.delete("/:id", ctrl.remove);
songsRouter.patch("/:id/capo", ctrl.updateCapo);
