import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const chords = await prisma.chordStatus.findMany({
      orderBy: { chordName: "asc" },
    });
    res.json(chords);
  } catch (e) {
    next(e);
  }
}

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { chordName } = req.params;
    const { status } = req.body; // "known" | "learning" | "none"

    const chord = await prisma.chordStatus.upsert({
      where: { chordName },
      update: { status },
      create: { chordName, status },
    });
    res.json(chord);
  } catch (e) {
    next(e);
  }
}

export async function bulkUpdate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { chords } = req.body as {
      chords: { chordName: string; status: string }[];
    };

    await prisma.$transaction(
      chords.map((c) =>
        prisma.chordStatus.upsert({
          where: { chordName: c.chordName },
          update: { status: c.status },
          create: { chordName: c.chordName, status: c.status },
        })
      )
    );

    const all = await prisma.chordStatus.findMany({
      orderBy: { chordName: "asc" },
    });
    res.json(all);
  } catch (e) {
    next(e);
  }
}
