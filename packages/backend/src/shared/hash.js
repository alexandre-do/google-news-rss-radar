import { createHash } from "node:crypto";

export function urlToUuid(url) {
  return createHash("sha256").update(url).digest("hex").slice(0, 24);
}
