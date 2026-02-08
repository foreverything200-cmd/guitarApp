import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const settingsRouter = Router();

settingsRouter.get("/", async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany();
    const obj: Record<string, string> = {};
    settings.forEach((s) => (obj[s.key] = s.value));
    res.json(obj);
  } catch (e) {
    next(e);
  }
});

settingsRouter.put("/:key", async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
    res.json(setting);
  } catch (e) {
    next(e);
  }
});
