from collections import defaultdict

import spacy
from fastapi import FastAPI
from pydantic import BaseModel

MODEL_NAME = "en_core_web_sm"
MIN_KEYWORD_LENGTH = 3

# Maps spaCy's default entity labels onto this project's entity taxonomy.
# Labels not listed here (CARDINAL, DATE, ORDINAL, PERCENT, MONEY, ...) are
# dropped — they're not useful as article metadata keywords.
LABEL_MAP = {
    "PERSON": "person",
    "ORG": "organization",
    "GPE": "place",
    "LOC": "place",
    "FAC": "place",
    "NORP": "group",
    "EVENT": "event",
    "PRODUCT": "product",
    "WORK_OF_ART": "work",
    "LAW": "law",
    "LANGUAGE": "language",
}

nlp = spacy.load(MODEL_NAME)
app = FastAPI(title="ner-service")


class NerRequest(BaseModel):
    text: str = ""
    max_keywords: int = 25


class Entity(BaseModel):
    text: str
    type: str
    count: int


@app.get("/health")
def health():
    return {"ok": True, "model": MODEL_NAME}


@app.post("/ner", response_model=list[Entity])
def ner(req: NerRequest):
    doc = nlp(req.text or "")

    named = {}
    named_keys = set()
    for ent in doc.ents:
        entity_type = LABEL_MAP.get(ent.label_)
        if not entity_type:
            continue
        text = ent.text.strip()
        key = (text.lower(), entity_type)
        if key not in named:
            named[key] = {"text": text, "type": entity_type, "count": 0}
        named[key]["count"] += 1
        named_keys.add(text.lower())

    keyword_counts = defaultdict(int)
    keyword_display = {}
    for chunk in doc.noun_chunks:
        text = chunk.text.strip()
        key = text.lower()
        if len(text) < MIN_KEYWORD_LENGTH or key in named_keys:
            continue
        keyword_counts[key] += 1
        keyword_display.setdefault(key, text)

    keywords = sorted(
        (
            {"text": keyword_display[key], "type": "keyword", "count": count}
            for key, count in keyword_counts.items()
        ),
        key=lambda e: e["count"],
        reverse=True,
    )[: req.max_keywords]

    entities = list(named.values()) + keywords
    entities.sort(key=lambda e: e["count"], reverse=True)
    return entities
