import { Router } from "express";
import { search, getArticle } from "../../search/searchService.js";
import { distinctSources } from "../../db/articleRepository.js";

export const articlesRouter = Router();

articlesRouter.get("/", async (req, res, next) => {
  try {
    const { q, source, from, to, status, page, pageSize } = req.query;
    res.json(await search({ q, source, from, to, status, page, pageSize }));
  } catch (err) {
    next(err);
  }
});

articlesRouter.get("/:uuid", async (req, res, next) => {
  try {
    const article = await getArticle(req.params.uuid);
    if (!article) return res.status(404).json({ error: "not found" });
    res.json(article);
  } catch (err) {
    next(err);
  }
});

export const sourcesRouter = Router();

sourcesRouter.get("/", async (req, res, next) => {
  try {
    res.json(await distinctSources());
  } catch (err) {
    next(err);
  }
});
