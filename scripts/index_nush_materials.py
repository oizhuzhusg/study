#!/usr/bin/env python3
"""Build a compact NUSH Chemistry materials index from image-based PDFs.

The PDFs exported from Google Drive are mostly page images. This script samples
pages and writes a local manifest by default. It does not call OpenAI, access the
network, or write material-derived content into deployable source files unless
explicit flags are supplied.
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from pypdf import PdfReader


DEFAULT_MATERIALS_DIR = Path("/Users/zhuk/Documents/Codex/nush-materials")
DEFAULT_CACHE_DIR = Path("data/materials-cache")
DEFAULT_JSON_OUTPUT = Path("data/materials-local-index.json")
DEFAULT_JS_OUTPUT = Path("src/shared/materials-index.js")
OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"

ALLOWED_SKILLS = [
    "experimental_chemistry",
    "kinetic_theory",
    "ions_charges",
    "chemical_bonding",
    "acid_base_basics",
    "acid_base_reactions",
    "salt_preparation",
    "redox_concepts",
    "oxidation_states",
    "volumetric_analysis",
    "titration_calculation",
    "qualitative_analysis",
    "precipitate_concept",
    "solubility_prediction",
    "formulae",
    "balancing",
    "state_symbols",
    "spectator_ions",
    "ionic_equation",
    "observation_inference",
    "explanation_quality",
    "sec1_gap_diagnosis",
]


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "document"


def read_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def openai_key() -> str:
    env_values = read_env_file(Path(".dev.vars"))
    key = os.environ.get("OPENAI_API_KEY") or env_values.get("OPENAI_API_KEY")
    if not key or not key.startswith("sk-"):
        raise RuntimeError("OPENAI_API_KEY is required in the environment or .dev.vars")
    return key


def model_name() -> str:
    env_values = read_env_file(Path(".dev.vars"))
    return (
        os.environ.get("OPENAI_MATERIALS_MODEL")
        or env_values.get("OPENAI_MATERIALS_MODEL")
        or os.environ.get("OPENAI_TRANSCRIBE_MODEL")
        or env_values.get("OPENAI_TRANSCRIBE_MODEL")
        or "gpt-4.1-mini"
    )


def pdf_image_data_url(page, page_index: int) -> tuple[str, str] | None:
    images = list(page.images)
    if not images:
        return None
    image = max(images, key=lambda item: len(item.data or b""))
    mime_type = mimetypes.guess_type(image.name or "")[0] or "image/png"
    encoded = base64.b64encode(image.data).decode("ascii")
    return f"data:{mime_type};base64,{encoded}", f"page {page_index + 1}"


def sampled_pages(pdf_path: Path, pages_per_pdf: int) -> tuple[int, list[dict[str, str]]]:
    reader = PdfReader(str(pdf_path))
    samples: list[dict[str, str]] = []
    for page_index, page in enumerate(reader.pages):
        image = pdf_image_data_url(page, page_index)
        if not image:
            continue
        data_url, label = image
        samples.append({"label": label, "data_url": data_url})
        if len(samples) >= pages_per_pdf:
            break
    return len(reader.pages), samples


def pdf_local_metadata(pdf_path: Path, materials_dir: Path, pages_per_pdf: int) -> dict:
    reader = PdfReader(str(pdf_path))
    page_image_counts: list[int] = []
    sampled_page_labels: list[str] = []
    for page_index, page in enumerate(reader.pages):
        images = list(page.images)
        page_image_counts.append(len(images))
        if images and len(sampled_page_labels) < pages_per_pdf:
            sampled_page_labels.append(f"page {page_index + 1}")

    relative_path = pdf_path.relative_to(materials_dir).as_posix()
    return {
        "id": slugify(relative_path.removesuffix(".pdf")),
        "title": pdf_path.stem,
        "course": pdf_path.parent.name,
        "path": relative_path,
        "pages": len(reader.pages),
        "indexedPages": sampled_page_labels,
        "pageImageCountsFirst10": page_image_counts[:10],
        "summary": "",
        "keyConcepts": [],
        "vocabulary": [],
        "questionTypes": [],
        "skillIds": [],
        "topicIds": [],
        "notes": "Local-only manifest. No page content was sent to any external API.",
    }


def schema() -> dict:
    return {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "summary": {"type": "string"},
            "key_concepts": {"type": "array", "items": {"type": "string"}},
            "vocabulary": {"type": "array", "items": {"type": "string"}},
            "question_types": {"type": "array", "items": {"type": "string"}},
            "skill_ids": {"type": "array", "items": {"type": "string"}},
            "topic_ids": {"type": "array", "items": {"type": "string"}},
            "notes": {"type": "string"},
        },
        "required": [
            "summary",
            "key_concepts",
            "vocabulary",
            "question_types",
            "skill_ids",
            "topic_ids",
            "notes",
        ],
    }


def call_openai_for_pdf(api_key: str, model: str, title: str, pages: list[dict[str, str]]) -> dict:
    content = [
        {
            "type": "input_text",
            "text": "\n".join(
                [
                    "Read these sampled NUSH Chemistry Year 1 material pages.",
                    "Build a concise learning index for an adaptive Chemistry tutor.",
                    "Only use information visible in the sampled pages and the file title.",
                    "Use skill_ids only from the allowed list.",
                    "Use topic_ids only from: sec1_foundations, sec2_chemistry_ii.",
                    "Return JSON only.",
                    "",
                    f"File title: {title}",
                    f"Allowed skill_ids: {json.dumps(ALLOWED_SKILLS)}",
                ]
            ),
        }
    ]
    for page in pages:
        content.append({"type": "input_text", "text": page["label"]})
        content.append({"type": "input_image", "image_url": page["data_url"], "detail": "high"})

    body = {
        "model": model,
        "input": [{"role": "user", "content": content}],
        "text": {
            "format": {
                "type": "json_schema",
                "name": "nush_material_index",
                "strict": True,
                "schema": schema(),
            }
        },
        "max_output_tokens": 1600,
    }
    request = urllib.request.Request(
        OPENAI_RESPONSES_URL,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI request failed for {title}: {detail}") from error

    text = payload.get("output_text")
    if not text:
        chunks: list[str] = []
        for item in payload.get("output", []):
            for part in item.get("content", []):
                if isinstance(part.get("text"), str):
                    chunks.append(part["text"])
                if isinstance(part.get("output_text"), str):
                    chunks.append(part["output_text"])
        text = "\n".join(chunks).strip()
    if not text:
        raise RuntimeError(f"OpenAI returned no text for {title}")
    return json.loads(text)


def safe_list(values, allowed: set[str] | None = None, limit: int = 20) -> list[str]:
    result: list[str] = []
    for value in values if isinstance(values, list) else []:
        item = str(value).strip()
        if not item:
            continue
        if allowed is not None and item not in allowed:
            continue
        if item not in result:
            result.append(item[:180])
    return result[:limit]


def normalize_document(pdf_path: Path, materials_dir: Path, pages: int, indexed_pages: list[str], extracted: dict) -> dict:
    relative_path = pdf_path.relative_to(materials_dir).as_posix()
    title = pdf_path.stem
    document_id = slugify(relative_path.removesuffix(".pdf"))
    return {
        "id": document_id,
        "title": title,
        "course": pdf_path.parent.name,
        "path": relative_path,
        "pages": pages,
        "indexedPages": indexed_pages,
        "summary": str(extracted.get("summary", "")).strip()[:800],
        "keyConcepts": safe_list(extracted.get("key_concepts", []), limit=24),
        "vocabulary": safe_list(extracted.get("vocabulary", []), limit=24),
        "questionTypes": safe_list(extracted.get("question_types", []), limit=16),
        "skillIds": safe_list(extracted.get("skill_ids", []), allowed=set(ALLOWED_SKILLS), limit=12),
        "topicIds": safe_list(extracted.get("topic_ids", []), allowed={"sec1_foundations", "sec2_chemistry_ii"}, limit=4),
        "notes": str(extracted.get("notes", "")).strip()[:800],
    }


def build_skill_links(documents: list[dict]) -> dict[str, list[str]]:
    links: dict[str, list[str]] = {}
    for document in documents:
        for skill_id in document.get("skillIds", []):
            links.setdefault(skill_id, []).append(document["id"])
    return {skill_id: ids for skill_id, ids in sorted(links.items())}


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_js(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = json.dumps(payload, ensure_ascii=False, indent=2)
    path.write_text(
        "\n".join(
            [
                f"export const materialIndex = {data};",
                "",
                "function unique(values) {",
                "  return Array.from(new Set(values.filter(Boolean)));",
                "}",
                "",
                "export function materialContextForSkills(skillIds = [], topicId = null, limit = 4) {",
                "  const wantedSkills = new Set(skillIds.filter(Boolean));",
                "  const linkedDocumentIds = unique(",
                "    skillIds.flatMap((skillId) => materialIndex.skillLinks?.[skillId] ?? [])",
                "  );",
                "  const linkedDocuments = linkedDocumentIds",
                "    .map((id) => materialIndex.documents.find((document) => document.id === id))",
                "    .filter(Boolean);",
                "  const fallbackDocuments = materialIndex.documents.filter((document) => {",
                "    if (topicId && document.topicIds?.length && !document.topicIds.includes(topicId)) {",
                "      return false;",
                "    }",
                "    return document.skillIds?.some((skillId) => wantedSkills.has(skillId));",
                "  });",
                "  const documents = unique([...linkedDocuments, ...fallbackDocuments].map((document) => document.id))",
                "    .map((id) => materialIndex.documents.find((document) => document.id === id))",
                "    .filter(Boolean)",
                "    .slice(0, limit);",
                "",
                "  if (!documents.length) {",
                "    return \"\";",
                "  }",
                "",
                "  return documents",
                "    .map((document) => {",
                "      const concepts = (document.keyConcepts ?? []).slice(0, 8).join(\"; \");",
                "      const questionTypes = (document.questionTypes ?? []).slice(0, 5).join(\"; \");",
                "      return [",
                "        `Document: ${document.title}`,",
                "        document.summary ? `Summary: ${document.summary}` : \"\",",
                "        concepts ? `Key concepts: ${concepts}` : \"\",",
                "        questionTypes ? `Question types: ${questionTypes}` : \"\"",
                "      ]",
                "        .filter(Boolean)",
                "        .join(\"\\n\");",
                "    })",
                "    .join(\"\\n\\n\");",
                "}",
                "",
            ]
        ),
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--materials-dir", type=Path, default=DEFAULT_MATERIALS_DIR)
    parser.add_argument("--pages-per-pdf", type=int, default=3)
    parser.add_argument("--limit", type=int, default=0, help="Limit number of PDFs processed; 0 means all")
    parser.add_argument("--refresh", action="store_true", help="Ignore cached per-document summaries")
    parser.add_argument("--cache-dir", type=Path, default=DEFAULT_CACHE_DIR)
    parser.add_argument("--json-output", type=Path, default=DEFAULT_JSON_OUTPUT)
    parser.add_argument("--js-output", type=Path, default=DEFAULT_JS_OUTPUT)
    parser.add_argument(
        "--use-openai",
        action="store_true",
        help="Explicitly allow sampled page images to be sent to OpenAI Vision for OCR/indexing.",
    )
    parser.add_argument(
        "--write-public-js",
        action="store_true",
        help="Write extracted material context into src/shared/materials-index.js. Only use with publishable derived content.",
    )
    args = parser.parse_args()

    materials_dir = args.materials_dir.expanduser().resolve()
    pdfs = sorted(materials_dir.rglob("*.pdf"))
    if args.limit:
        pdfs = pdfs[: args.limit]
    if not pdfs:
        raise RuntimeError(f"No PDFs found under {materials_dir}")

    api_key = openai_key() if args.use_openai else ""
    model = model_name() if args.use_openai else ""
    documents: list[dict] = []
    args.cache_dir.mkdir(parents=True, exist_ok=True)
    if not args.use_openai:
        print("local-only mode: no network calls, no OpenAI API, no page content extraction")
    elif not args.write_public_js:
        print("OpenAI mode: writing private JSON/cache under data/ only; public JS index will not be updated")

    for pdf_path in pdfs:
        document_id = slugify(pdf_path.relative_to(materials_dir).as_posix().removesuffix(".pdf"))
        cache_path = args.cache_dir / f"{document_id}.json"
        if args.use_openai and cache_path.exists() and not args.refresh:
            cached = json.loads(cache_path.read_text(encoding="utf-8"))
            documents.append(cached)
            print(f"cached {pdf_path.name}")
            continue

        if not args.use_openai:
            document = pdf_local_metadata(pdf_path, materials_dir, args.pages_per_pdf)
            print(f"manifest {pdf_path.name}")
            documents.append(document)
            continue

        pages, samples = sampled_pages(pdf_path, args.pages_per_pdf)
        if not samples:
            print(f"skip no page images: {pdf_path.name}", file=sys.stderr)
            continue
        print(f"indexing {pdf_path.name} ({len(samples)} sampled pages)")
        extracted = call_openai_for_pdf(api_key, model, pdf_path.stem, samples)
        document = normalize_document(pdf_path, materials_dir, pages, [sample["label"] for sample in samples], extracted)
        write_json(cache_path, document)
        documents.append(document)
        time.sleep(0.25)

    documents.sort(key=lambda item: item["path"])
    payload = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "source": "nush-materials",
        "mode": "openai" if args.use_openai else "local-only",
        "materialsDir": materials_dir.name,
        "pagesPerPdf": args.pages_per_pdf,
        "documents": documents,
        "skillLinks": build_skill_links(documents),
    }
    write_json(args.json_output, payload)
    print(f"wrote {args.json_output}")
    if args.write_public_js:
        if not args.use_openai:
            raise RuntimeError("--write-public-js is only useful with --use-openai extracted summaries")
        write_js(args.js_output, payload)
        print(f"wrote {args.js_output}")
    else:
        print("did not write public JS index")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
