import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { category } = req.query;
    const where = category ? { category: String(category) } : {};
    const artists = await prisma.artist.findMany({
      where,
      include: { _count: { select: { songs: true } } },
      orderBy: { name: "asc" },
    });
    res.json(artists);
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
    const artist = await prisma.artist.findUnique({
      where: { id: req.params.id },
      include: {
        songs: { include: { artist: true }, orderBy: { title: "asc" } },
        _count: { select: { songs: true } },
      },
    });
    if (!artist) {
      res.status(404).json({ error: { message: "Artist not found" } });
      return;
    }
    res.json(artist);
  } catch (e) {
    next(e);
  }
}

export async function getArtistSongs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const songs = await prisma.song.findMany({
      where: { artistId: req.params.id },
      include: { artist: true },
      orderBy: { title: "asc" },
    });
    res.json(songs);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, category } = req.body;
    const file = req.file;
    const artist = await prisma.artist.create({
      data: {
        name,
        category,
        photoPath: file ? `/uploads/${file.filename}` : null,
      },
    });
    res.status(201).json(artist);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, category } = req.body;
    const file = req.file;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (file) data.photoPath = `/uploads/${file.filename}`;

    const artist = await prisma.artist.update({
      where: { id: req.params.id },
      data,
    });
    res.json(artist);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.artist.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}
