import { Router } from "express";
import * as ctrl from "../controllers/chords.controller.js";

export const chordsRouter = Router();

chordsRouter.get("/", ctrl.getAll);
chordsRouter.put("/:chordName", ctrl.updateStatus);
chordsRouter.put("/", ctrl.bulkUpdate);
