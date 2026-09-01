import { trendsByDay, trendsBySource } from "../db/articleRepository.js";

export async function getTrends({ dimension = "day", from, to, source } = {}) {
  if (dimension === "source") {
    return trendsBySource({ from, to });
  }
  return trendsByDay({ from, to, source });
}
