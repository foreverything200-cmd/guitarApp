import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { extractChords, transposeContent } from "../utils/transpose.js";

const prisma = new PrismaClient();

// Helper to get file paths from multer
function getFilePaths(req: Request) {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  return {
    albumCoverPath: files?.albumCover?.[0]
      ? `/uploads/${files.albumCover[0].filename}`
      : undefined,
    chordSheetImage: files?.chordSheet?.[0]
      ? `/uploads/${files.chordSheet[0].filename}`
      : undefined,
  };
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { category } = req.query;
    const where = category ? { category: String(category) } : {};
    const songs = await prisma.song.findMany({
      where,
      include: { artist: true },
      orderBy: { title: "asc" },
    });
    res.json(songs);
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
    const song = await prisma.song.findUnique({
      where: { id: req.params.id },
      include: { artist: true },
    });
    if (!song) {
      res.status(404).json({ error: { message: "Song not found" } });
      return;
    }
    // Also return extracted chords list
    const chords = extractChords(song.content);
    res.json({ ...song, chords });
  } catch (e) {
    next(e);
  }
}

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, category } = req.query;
    if (!q) {
      res.json([]);
      return;
    }
    const query = String(q).toLowerCase();
    const where: any = {
      OR: [
        { title: { contains: query } },
        { artist: { name: { contains: query } } },
      ],
    };
    if (category) where.category = String(category);

    const songs = await prisma.song.findMany({
      where,
      include: { artist: true },
      orderBy: { title: "asc" },
    });
    res.json(songs);
  } catch (e) {
    next(e);
  }
}

export async function getRandom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { category, exclude } = req.query;
    const where: any = {};
    if (category) where.category = String(category);
    if (exclude) where.id = { not: String(exclude) };

    const count = await prisma.song.count({ where });
    if (count === 0) {
      res.status(404).json({ error: { message: "No songs found" } });
      return;
    }
    const skip = Math.floor(Math.random() * count);
    const songs = await prisma.song.findMany({
      where,
      include: { artist: true },
      skip,
      take: 1,
    });
    const song = songs[0];
    const chords = extractChords(song.content);
    res.json({ ...song, chords });
  } catch (e) {
    next(e);
  }
}

export async function getKnownSongs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { category } = req.query;
    // Get all "known" chords
    const knownChords = await prisma.chordStatus.findMany({
      where: { status: "known" },
    });
    const knownSet = new Set(knownChords.map((c) => c.chordName));

    if (knownSet.size === 0) {
      res.json([]);
      return;
    }

    const where: any = {};
    if (category) where.category = String(category);

    const songs = await prisma.song.findMany({
      where,
      include: { artist: true },
      orderBy: { title: "asc" },
    });

    // Filter: ALL chords in the song must be in knownSet
    const filtered = songs.filter((song) => {
      const songChords = extractChords(song.content);
      return songChords.length > 0 && songChords.every((c) => knownSet.has(c));
    });

    res.json(filtered);
  } catch (e) {
    next(e);
  }
}

export async function getLearningSongs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { category } = req.query;
    const allStatuses = await prisma.chordStatus.findMany({
      where: { status: { in: ["known", "learning"] } },
    });
    const knownSet = new Set(
      allStatuses.filter((c) => c.status === "known").map((c) => c.chordName)
    );
    const learningSet = new Set(
      allStatuses
        .filter((c) => c.status === "learning")
        .map((c) => c.chordName)
    );

    if (knownSet.size === 0 && learningSet.size === 0) {
      res.json([]);
      return;
    }

    const where: any = {};
    if (category) where.category = String(category);

    const songs = await prisma.song.findMany({
      where,
      include: { artist: true },
      orderBy: { title: "asc" },
    });

    // Filter: all chords must be known or learning, and at least one must be learning
    const filtered = songs.filter((song) => {
      const songChords = extractChords(song.content);
      if (songChords.length === 0) return false;
      const allCovered = songChords.every(
        (c) => knownSet.has(c) || learningSet.has(c)
      );
      const hasLearning = songChords.some((c) => learningSet.has(c));
      return allCovered && hasLearning;
    });

    res.json(filtered);
  } catch (e) {
    next(e);
  }
}

export async function getStats(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const [total, jewish, nonJewish] = await Promise.all([
      prisma.song.count(),
      prisma.song.count({ where: { category: "jewish" } }),
      prisma.song.count({ where: { category: "non-jewish" } }),
    ]);
    res.json({ total, jewish, nonJewish });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, artistId, artistName, category, capoOriginal, youtubeUrl, content } =
      req.body;
    const { albumCoverPath, chordSheetImage } = getFilePaths(req);

    // Create or find artist
    let resolvedArtistId = artistId;
    if (!resolvedArtistId && artistName) {
      const existing = await prisma.artist.findFirst({
        where: { name: artistName, category },
      });
      if (existing) {
        resolvedArtistId = existing.id;
      } else {
        const newArtist = await prisma.artist.create({
          data: { name: artistName, category },
        });
        resolvedArtistId = newArtist.id;
      }
    }

    const song = await prisma.song.create({
      data: {
        title,
        artistId: resolvedArtistId,
        category,
        capoOriginal: parseInt(capoOriginal) || 0,
        capoPreferred: parseInt(capoOriginal) || 0,
        youtubeUrl: youtubeUrl || null,
        content: content || "",
        albumCoverPath: albumCoverPath || null,
        chordSheetImage: chordSheetImage || null,
      },
      include: { artist: true },
    });

    res.status(201).json(song);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { title, artistId, artistName, category, capoOriginal, youtubeUrl, content } =
      req.body;
    const { albumCoverPath, chordSheetImage } = getFilePaths(req);

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (category !== undefined) data.category = category;
    if (capoOriginal !== undefined)
      data.capoOriginal = parseInt(capoOriginal) || 0;
    if (youtubeUrl !== undefined) data.youtubeUrl = youtubeUrl || null;
    if (content !== undefined) data.content = content;
    if (albumCoverPath) data.albumCoverPath = albumCoverPath;
    if (chordSheetImage) data.chordSheetImage = chordSheetImage;

    // Handle artist update
    if (artistId) {
      data.artistId = artistId;
    } else if (artistName) {
      const cat = category || "non-jewish";
      const existing = await prisma.artist.findFirst({
        where: { name: artistName, category: cat },
      });
      if (existing) {
        data.artistId = existing.id;
      } else {
        const newArtist = await prisma.artist.create({
          data: { name: artistName, category: cat },
        });
        data.artistId = newArtist.id;
      }
    }

    const song = await prisma.song.update({
      where: { id },
      data,
      include: { artist: true },
    });

    res.json(song);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.song.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function updateCapo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { capoPreferred } = req.body;
    const song = await prisma.song.update({
      where: { id },
      data: { capoPreferred: parseInt(capoPreferred) || 0 },
      include: { artist: true },
    });
    res.json(song);
  } catch (e) {
    next(e);
  }
}
