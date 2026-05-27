#!/usr/bin/env python3
"""Build a compact NUSH Chemistry materials index from image-based PDFs.

The PDFs exported from Google Drive are mostly page images. This script samples
pages and writes a local manifest by default. It can optionally run a local OCR
engine such as Tesseract. It does not call OpenAI, access the network, or write
material-derived content into deployable source files unless explicit flags are
supplied.
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from pypdf import PdfReader


DEFAULT_MATERIALS_DIR = Path("/Users/zhuk/Documents/Codex/nush-materials")
DEFAULT_CACHE_DIR = Path("data/materials-cache")
DEFAULT_PAGE_IMAGE_DIR = Path("data/materials-page-images")
DEFAULT_OCR_TEXT_DIR = Path("data/materials-ocr-text")
DEFAULT_JSON_OUTPUT = Path("data/materials-local-index.json")
DEFAULT_JS_OUTPUT = Path("src/shared/materials-index.js")
OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"

ALLOWED_SKILLS = [
    "scientific_inquiry",
    "lab_safety",
    "measurement_apparatus",
    "experimental_chemistry",
    "kinetic_theory",
    "elements_periodic_table",
    "substances_mixtures",
    "separation_methods",
    "atomic_structure",
    "ions_charges",
    "ionic_bonding",
    "covalent_bonding",
    "chemical_bonding",
    "acid_base_basics",
    "acid_base_reactions",
    "salt_preparation",
    "mole_concept",
    "chemical_calculation",
    "concentration_calculation",
    "redox_concepts",
    "oxidation_states",
    "volumetric_analysis",
    "titration_calculation",
    "qualitative_analysis",
    "metallic_bonding",
    "giant_covalent",
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


def page_image_record(page, page_index: int) -> dict | None:
    images = list(page.images)
    if not images:
        return None
    image = max(images, key=lambda item: len(item.data or b""))
    data = image.data or b""
    if not data:
        return None
    image_name = image.name or f"page-{page_index + 1}.png"
    mime_type = mimetypes.guess_type(image_name)[0] or "image/png"
    suffix = Path(image_name).suffix.lower() or mimetypes.guess_extension(mime_type) or ".png"
    return {
        "label": f"page {page_index + 1}",
        "pageIndex": page_index,
        "pageNumber": page_index + 1,
        "name": image_name,
        "mimeType": mime_type,
        "suffix": suffix,
        "data": data,
    }


def image_data_url(image: dict) -> str:
    encoded = base64.b64encode(image["data"]).decode("ascii")
    return f"data:{image['mimeType']};base64,{encoded}"


def sampled_page_images(pdf_path: Path, pages_per_pdf: int) -> tuple[int, list[dict]]:
    reader = PdfReader(str(pdf_path))
    samples: list[dict] = []
    for page_index, page in enumerate(reader.pages):
        image = page_image_record(page, page_index)
        if not image:
            continue
        samples.append(image)
        if len(samples) >= pages_per_pdf:
            break
    return len(reader.pages), samples


def sampled_pages(pdf_path: Path, pages_per_pdf: int) -> tuple[int, list[dict[str, str]]]:
    page_count, images = sampled_page_images(pdf_path, pages_per_pdf)
    return page_count, [{"label": image["label"], "data_url": image_data_url(image)} for image in images]


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
    document = {
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
    if extracted.get("ocr_engine"):
        document["ocrEngine"] = str(extracted["ocr_engine"]).strip()[:80]
    if extracted.get("ocr_text_path"):
        document["ocrTextPath"] = str(extracted["ocr_text_path"]).strip()[:240]
    return document


CHEMISTRY_TERMS = [
    "apparatus",
    "beaker",
    "burette",
    "pipette",
    "measuring cylinder",
    "meniscus",
    "accuracy",
    "precision",
    "hazard",
    "diffusion",
    "kinetic energy",
    "Brownian motion",
    "particle",
    "atom",
    "ion",
    "molecule",
    "element",
    "compound",
    "mixture",
    "periodic table",
    "proton",
    "neutron",
    "electron",
    "electronic configuration",
    "ionic bond",
    "covalent bond",
    "simple molecular",
    "acid",
    "base",
    "alkali",
    "neutralisation",
    "salt",
    "indicator",
    "filtration",
    "evaporation",
    "distillation",
    "crystallisation",
    "chromatography",
]


def infer_topic_ids(title: str, course: str) -> list[str]:
    haystack = f"{title} {course}".lower()
    if "year 2" in haystack or "sec2" in haystack or "sec 2" in haystack or "chemistry ii" in haystack:
        return ["sec2_chemistry_ii"]
    return ["sec1_foundations"]


def infer_skill_ids(title: str, text: str) -> list[str]:
    haystack = f"{title}\n{text[:8000]}".lower()
    rules = [
        ("scientific_inquiry", ["scientific inquiry", "fair test", "variable", "hypothesis", "process skills", "conclusion", "data"]),
        ("lab_safety", ["safety", "hazard", "spill", "waft", "fume", "goggles", "bunsen"]),
        ("measurement_apparatus", ["pipette", "burette", "measuring cylinder", "meniscus", "titre", "accurate volume"]),
        ("experimental_chemistry", ["laboratory", "apparatus", "bunsen", "beaker", "pipette", "burette", "measuring cylinder", "meniscus", "hazard", "safety"]),
        ("observation_inference", ["observation", "infer", "conclusion", "evidence"]),
        ("kinetic_theory", ["particulate", "kinetic", "diffusion", "brownian", "states of matter", "particle"]),
        ("elements_periodic_table", ["periodic table", "element", "metal", "non-metal", "group", "period"]),
        ("substances_mixtures", ["mixture", "compound", "element", "homogeneous", "heterogeneous", "physical change", "chemical change"]),
        ("separation_methods", ["filtration", "evaporation", "crystallisation", "distillation", "chromatography", "purification"]),
        ("atomic_structure", ["atomic structure", "proton number", "nucleon", "isotope", "neutron", "electronic structure"]),
        ("ions_charges", ["ion", "cation", "anion", "charge", "proton", "electron"]),
        ("formulae", ["formula", "compound", "valency", "chemical formula"]),
        ("ionic_bonding", ["ionic bond", "electron transfer", "oppositely charged ions", "dot-and-cross"]),
        ("covalent_bonding", ["covalent", "electron sharing", "simple molecular", "shared pair"]),
        ("chemical_bonding", ["bonding", "ionic bond", "covalent", "simple molecular", "structure"]),
        ("acid_base_basics", ["acid", "base", "alkali", "indicator", "ph"]),
        ("acid_base_reactions", ["neutralisation", "salt", "acid reacts", "carbonate"]),
        ("mole_concept", ["mole", "avogadro", "molar mass", "relative molecular mass", "amount of substance"]),
        ("chemical_calculation", ["stoichiometry", "mole ratio", "reacting mass", "limiting reactant", "excess reactant"]),
        ("concentration_calculation", ["concentration", "mol/dm", "g/dm", "dm3", "cm3", "dilution"]),
        ("volumetric_analysis", ["titration", "burette", "pipette", "endpoint", "titre", "standard solution"]),
        ("titration_calculation", ["titre", "concentration", "titration calculation", "mol/dm"]),
        ("metallic_bonding", ["metallic bonding", "delocalised", "sea of electrons", "alloy", "malleable"]),
        ("giant_covalent", ["giant covalent", "diamond", "graphite", "graphene", "silicon dioxide", "fullerene"]),
        ("balancing", ["balance", "balanced equation", "equation"]),
        ("state_symbols", ["state symbol", "(aq)", "(s)", "(l)", "(g)"]),
        ("explanation_quality", ["explain", "describe", "why", "reason"]),
    ]
    skill_ids: list[str] = []
    for skill_id, keywords in rules:
        if any(keyword in haystack for keyword in keywords):
            skill_ids.append(skill_id)
    if any(keyword in haystack for keyword in ["revision", "class test", "worksheet", "practice"]):
        skill_ids.append("sec1_gap_diagnosis")
    return safe_list(skill_ids, allowed=set(ALLOWED_SKILLS), limit=12)


def clean_ocr_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def is_probable_heading(line: str) -> bool:
    compact = line.strip(":- ")
    if not (4 <= len(compact) <= 90):
        return False
    if re.fullmatch(r"\d+", compact):
        return False
    if compact.count(" ") > 10:
        return False
    if compact.endswith("?"):
        return False
    if re.search(r"\b(page|name|class|date)\b", compact, re.IGNORECASE):
        return False
    starts_like_heading = bool(re.match(r"^(\d+(\.\d+)*\s+|Topic\s+\d+|Part\s+[A-Z]|Chapter\s+\d+)", compact, re.IGNORECASE))
    title_like = sum(1 for word in compact.split() if word[:1].isupper()) >= max(1, len(compact.split()) // 2)
    return starts_like_heading or title_like or compact.isupper()


def local_key_concepts(title: str, text: str) -> list[str]:
    concepts: list[str] = [title]
    for line in clean_ocr_text(text).splitlines():
        line = line.strip(" \t-\u2022")
        if is_probable_heading(line):
            concepts.append(line)
    return safe_list(concepts, limit=24)


def local_vocabulary(text: str) -> list[str]:
    haystack = text.lower()
    terms = [term for term in CHEMISTRY_TERMS if term.lower() in haystack]
    return safe_list(terms, limit=24)


def local_question_types(text: str) -> list[str]:
    haystack = text.lower()
    question_types: list[str] = []
    if "explain" in haystack or "why" in haystack:
        question_types.append("Explain reasoning using chemistry concepts")
    if "calculate" in haystack or "determine" in haystack:
        question_types.append("Calculate or determine a value from given data")
    if "state" in haystack or "name" in haystack:
        question_types.append("State or name a chemistry term, property, or apparatus")
    if "describe" in haystack or "observation" in haystack:
        question_types.append("Describe observations and link them to inference")
    if "draw" in haystack or "diagram" in haystack:
        question_types.append("Draw or interpret diagrams")
    question_lines = [line.strip() for line in clean_ocr_text(text).splitlines() if line.strip().endswith("?")]
    question_types.extend(question_lines[:6])
    return safe_list(question_types, limit=16)


def build_local_ocr_extracted(pdf_path: Path, materials_dir: Path, text: str, text_path: Path | None, ocr_engine: str) -> dict:
    title = pdf_path.stem
    course = pdf_path.parent.name
    concepts = local_key_concepts(title, text)
    summary_suffix = f" Key visible headings include: {', '.join(concepts[:5])}." if concepts else ""
    relative_text_path = text_path.as_posix() if text_path else ""
    return {
        "summary": f"Local OCR extracted sampled page text from {title}.{summary_suffix}".strip(),
        "key_concepts": concepts,
        "vocabulary": local_vocabulary(text),
        "question_types": local_question_types(text),
        "skill_ids": infer_skill_ids(title, text),
        "topic_ids": infer_topic_ids(title, course),
        "notes": "Local OCR only. No page image or text was sent to any external API.",
        "ocr_engine": ocr_engine,
        "ocr_text_path": relative_text_path,
    }


def save_page_image(image: dict, pdf_path: Path, materials_dir: Path, page_image_dir: Path) -> Path:
    document_id = slugify(pdf_path.relative_to(materials_dir).as_posix().removesuffix(".pdf"))
    target_dir = page_image_dir / document_id
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / f"page-{image['pageNumber']:03d}{image['suffix']}"
    target.write_bytes(image["data"])
    return target


def run_tesseract(image_path: Path, language: str, page_segmentation_mode: str, timeout: int = 120) -> str:
    tesseract = shutil.which("tesseract")
    if not tesseract:
        raise RuntimeError(
            "Local OCR requested, but `tesseract` was not found on this Mac. "
            "Install a local Tesseract binary first, then rerun with --local-ocr tesseract. "
            "No OpenAI request or network upload was made."
        )
    command = [tesseract, str(image_path), "stdout", "-l", language, "--psm", page_segmentation_mode]
    completed = subprocess.run(command, capture_output=True, text=True, timeout=timeout, check=False)
    if completed.returncode != 0:
        detail = completed.stderr.strip() or completed.stdout.strip()
        raise RuntimeError(f"Tesseract failed for {image_path}: {detail}")
    return clean_ocr_text(completed.stdout)


def run_rapidocr(image_path: Path) -> str:
    try:
        from rapidocr_onnxruntime import RapidOCR
    except ImportError as error:
        raise RuntimeError(
            "Local OCR requested, but `rapidocr-onnxruntime` is not installed in this Python environment. "
            "Use .venv-ocr/bin/python or install rapidocr-onnxruntime locally. No external API was called."
        ) from error

    if not hasattr(run_rapidocr, "_engine"):
        run_rapidocr._engine = RapidOCR()

    result, _ = run_rapidocr._engine(str(image_path))
    if not result:
        return ""

    def sort_key(item) -> tuple[float, float]:
        box = item[0]
        top = min(point[1] for point in box)
        left = min(point[0] for point in box)
        return top, left

    lines = [str(item[1]).strip() for item in sorted(result, key=sort_key) if str(item[1]).strip()]
    return clean_ocr_text("\n".join(lines))


def local_ocr_document(
    pdf_path: Path,
    materials_dir: Path,
    pages_per_pdf: int,
    page_image_dir: Path,
    ocr_text_dir: Path,
    local_ocr: str,
    ocr_language: str,
    ocr_psm: str,
) -> dict:
    pages, samples = sampled_page_images(pdf_path, pages_per_pdf)
    if not samples:
        document = pdf_local_metadata(pdf_path, materials_dir, pages_per_pdf)
        document["notes"] = "Local OCR requested, but no page images were found. No external API was used."
        return document

    text_blocks: list[str] = []
    indexed_pages: list[str] = []
    for image in samples:
        image_path = save_page_image(image, pdf_path, materials_dir, page_image_dir)
        if local_ocr == "rapidocr":
            page_text = run_rapidocr(image_path)
        else:
            page_text = run_tesseract(image_path, ocr_language, ocr_psm)
        indexed_pages.append(image["label"])
        if page_text:
            text_blocks.append(f"## {image['label']}\n{page_text}")

    document_id = slugify(pdf_path.relative_to(materials_dir).as_posix().removesuffix(".pdf"))
    ocr_text_dir.mkdir(parents=True, exist_ok=True)
    text_path = ocr_text_dir / f"{document_id}.txt"
    text_path.write_text("\n\n".join(text_blocks).strip() + "\n", encoding="utf-8")
    ocr_engine = "rapidocr-onnxruntime" if local_ocr == "rapidocr" else f"tesseract:{ocr_language}"
    extracted = build_local_ocr_extracted(pdf_path, materials_dir, "\n\n".join(text_blocks), text_path, ocr_engine)
    return normalize_document(pdf_path, materials_dir, pages, indexed_pages, extracted)


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
    parser.add_argument("--page-image-dir", type=Path, default=DEFAULT_PAGE_IMAGE_DIR)
    parser.add_argument("--ocr-text-dir", type=Path, default=DEFAULT_OCR_TEXT_DIR)
    parser.add_argument("--json-output", type=Path, default=DEFAULT_JSON_OUTPUT)
    parser.add_argument("--js-output", type=Path, default=DEFAULT_JS_OUTPUT)
    parser.add_argument(
        "--local-ocr",
        choices=["none", "tesseract", "rapidocr"],
        default="none",
        help="Run a local OCR engine on sampled PDF page images. No network calls are made.",
    )
    parser.add_argument("--ocr-language", default="eng", help="Tesseract language code, such as eng")
    parser.add_argument("--ocr-psm", default="3", help="Tesseract page segmentation mode; 3 works well for full pages")
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
    if args.use_openai and args.local_ocr != "none":
        raise RuntimeError("Choose either --use-openai or --local-ocr; do not combine external and local OCR modes.")
    if args.write_public_js and not args.use_openai:
        raise RuntimeError(
            "--write-public-js is disabled for local-only/local-OCR modes so private school material is not "
            "accidentally committed or deployed."
        )

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
    if not args.use_openai and args.local_ocr == "none":
        print("local-only mode: no network calls, no OpenAI API, no page content extraction")
    elif args.local_ocr == "tesseract":
        if not shutil.which("tesseract"):
            raise RuntimeError(
                "Local OCR mode needs `tesseract`, but it is not installed or not in PATH. "
                "Install Tesseract locally first, then rerun this command. No external API was called."
            )
        print("local OCR mode: extracting sampled page images and running local Tesseract only")
    elif args.local_ocr == "rapidocr":
        try:
            import rapidocr_onnxruntime  # noqa: F401
        except ImportError as error:
            raise RuntimeError(
                "Local OCR mode needs `rapidocr-onnxruntime`. Use .venv-ocr/bin/python to run this script. "
                "No external API was called."
            ) from error
        print("local OCR mode: extracting sampled page images and running local RapidOCR only")
    elif not args.write_public_js:
        print("OpenAI mode: writing private JSON/cache under data/ only; public JS index will not be updated")

    for pdf_path in pdfs:
        document_id = slugify(pdf_path.relative_to(materials_dir).as_posix().removesuffix(".pdf"))
        cache_mode = "openai" if args.use_openai else args.local_ocr
        cache_path = args.cache_dir / f"{document_id}.{cache_mode}.json"
        if cache_mode != "none" and cache_path.exists() and not args.refresh:
            cached = json.loads(cache_path.read_text(encoding="utf-8"))
            documents.append(cached)
            print(f"cached {pdf_path.name}")
            continue

        if not args.use_openai and args.local_ocr == "none":
            document = pdf_local_metadata(pdf_path, materials_dir, args.pages_per_pdf)
            print(f"manifest {pdf_path.name}")
            documents.append(document)
            continue

        if args.local_ocr in {"tesseract", "rapidocr"}:
            document = local_ocr_document(
                pdf_path,
                materials_dir,
                args.pages_per_pdf,
                args.page_image_dir,
                args.ocr_text_dir,
                args.local_ocr,
                args.ocr_language,
                args.ocr_psm,
            )
            write_json(cache_path, document)
            print(f"local OCR {pdf_path.name}")
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
        "mode": "openai" if args.use_openai else (f"local-ocr-{args.local_ocr}" if args.local_ocr != "none" else "local-only"),
        "materialsDir": materials_dir.name,
        "pagesPerPdf": args.pages_per_pdf,
        "documents": documents,
        "skillLinks": build_skill_links(documents),
    }
    write_json(args.json_output, payload)
    print(f"wrote {args.json_output}")
    if args.write_public_js:
        write_js(args.js_output, payload)
        print(f"wrote {args.js_output}")
    else:
        print("did not write public JS index")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
