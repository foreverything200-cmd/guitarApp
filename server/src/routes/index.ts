import { Router } from "express";
import { songsRouter } from "./songs.routes.js";
import { artistsRouter } from "./artists.routes.js";
import { playlistsRouter } from "./playlists.routes.js";
import { chordsRouter } from "./chords.routes.js";
import { settingsRouter } from "./settings.routes.js";

export const router = Router();

router.use("/songs", songsRouter);
router.use("/artists", artistsRouter);
router.use("/playlists", playlistsRouter);
router.use("/chords", chordsRouter);
router.use("/settings", settingsRouter);
