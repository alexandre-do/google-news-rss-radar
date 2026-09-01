import { searchArticles, findByUuid } from "../db/articleRepository.js";

// Semantic/vector search extension point: add an `embedding` field to the
// extraction stage and a Mongo Atlas vector index, then branch here on a
// `mode=semantic` param instead of the $text query used below.

export async function search(params) {
  return searchArticles(params);
}

export async function getArticle(uuid) {
  return findByUuid(uuid);
}
