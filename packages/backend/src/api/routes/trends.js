import { Router } from "express";
import { getTrends } from "../../search/trendsService.js";

export const trendsRouter = Router();

trendsRouter.get("/", async (req, res, next) => {
  try {
    const { dimension, from, to, source } = req.query;
    res.json(await getTrends({ dimension, from, to, source }));
  } catch (err) {
    next(err);
  }
});
