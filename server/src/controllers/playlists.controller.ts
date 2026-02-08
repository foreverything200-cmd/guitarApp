import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { category } = req.query;
    const where = category ? { category: String(category) } : {};
    const playlists = await prisma.playlist.findMany({
      where,
      include: {
        _count: { select: { songs: true } },
        songs: {
          include: { song: { include: { artist: true } } },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
    res.json(playlists);
  } catch (e) {
    next(e);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { songs: true } },
        songs: {
          include: { song: { include: { artist: true } } },
          orderBy: { order: "asc" },
        },
      },
    });
    if (!playlist) {
      res.status(404).json({ error: { message: "Playlist not found" } });
      return;
    }
    res.json(playlist);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, category } = req.body;
    const playlist = await prisma.playlist.create({
      data: { name, category: category || "mixed" },
      include: { _count: { select: { songs: true } } },
    });
    res.status(201).json(playlist);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, category } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;

    const playlist = await prisma.playlist.update({
      where: { id: req.params.id },
      data,
      include: { _count: { select: { songs: true } } },
    });
    res.json(playlist);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.playlist.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function addSong(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { songId } = req.body;

    // Get current max order
    const maxOrder = await prisma.playlistSong.findFirst({
      where: { playlistId: id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const entry = await prisma.playlistSong.create({
      data: {
        playlistId: id,
        songId,
        order: (maxOrder?.order ?? -1) + 1,
      },
      include: { song: { include: { artist: true } } },
    });
    res.status(201).json(entry);
  } catch (e) {
    next(e);
  }
}

export async function removeSong(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id, songId } = req.params;
    await prisma.playlistSong.deleteMany({
      where: { playlistId: id, songId },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function reorderSongs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { songIds } = req.body as { songIds: string[] };

    await prisma.$transaction(
      songIds.map((songId, index) =>
        prisma.playlistSong.updateMany({
          where: { playlistId: id, songId },
          data: { order: index },
        })
      )
    );

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          include: { song: { include: { artist: true } } },
          orderBy: { order: "asc" },
        },
      },
    });
    res.json(playlist);
  } catch (e) {
    next(e);
  }
}

export async function getRandomSong(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { exclude } = req.query;
    const where: any = { playlistId: id };
    if (exclude) where.songId = { not: String(exclude) };

    const count = await prisma.playlistSong.count({ where });
    if (count === 0) {
      res
        .status(404)
        .json({ error: { message: "No songs in this playlist" } });
      return;
    }

    const skip = Math.floor(Math.random() * count);
    const entries = await prisma.playlistSong.findMany({
      where,
      include: { song: { include: { artist: true } } },
      skip,
      take: 1,
    });
    res.json(entries[0].song);
  } catch (e) {
    next(e);
  }
}
