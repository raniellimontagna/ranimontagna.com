#!/usr/bin/env python3
"""Generate the localized CV PDFs from scripts/cv-content.json."""

from __future__ import annotations

import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
CONTENT_PATH = ROOT / "scripts" / "cv-content.json"
OUTPUT_DIRECTORY = ROOT / "public" / "cv"
FONT_REGULAR = Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf")
FONT_BOLD = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
MARGIN = 14 * mm


class DeterministicCanvas(canvas.Canvas):
    """Canvas with stable PDF metadata for reproducible output."""

    def __init__(self, *args, **kwargs):
        kwargs["invariant"] = 1
        super().__init__(*args, **kwargs)


def register_fonts() -> None:
    if not FONT_REGULAR.is_file() or not FONT_BOLD.is_file():
        raise FileNotFoundError(
            "A Unicode-capable Arial font was not found at the expected macOS paths."
        )
    pdfmetrics.registerFont(TTFont("CVUnicode", str(FONT_REGULAR)))
    pdfmetrics.registerFont(TTFont("CVUnicode-Bold", str(FONT_BOLD)))


def paragraph(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(escape(text).replace("\n", "<br/>"), style)


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()["BodyText"]
    return {
        "name": ParagraphStyle(
            "CVName", parent=base, fontName="CVUnicode-Bold", fontSize=18,
            leading=22, textColor=colors.HexColor("#111827"), spaceAfter=2,
        ),
        "headline": ParagraphStyle(
            "CVHeadline", parent=base, fontName="CVUnicode", fontSize=10.5,
            leading=14, textColor=colors.HexColor("#374151"), spaceAfter=3,
        ),
        "contact": ParagraphStyle(
            "CVContact", parent=base, fontName="CVUnicode", fontSize=10,
            leading=12, textColor=colors.HexColor("#4B5563"), spaceAfter=9,
        ),
        "heading": ParagraphStyle(
            "CVHeading", parent=base, fontName="CVUnicode-Bold", fontSize=11,
            leading=14, textColor=colors.HexColor("#166534"), spaceBefore=6,
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "CVBody", parent=base, fontName="CVUnicode", fontSize=9.6,
            leading=12.3, textColor=colors.HexColor("#1F2937"), spaceAfter=3,
            alignment=TA_LEFT,
        ),
        "role": ParagraphStyle(
            "CVRole", parent=base, fontName="CVUnicode-Bold", fontSize=10,
            leading=13, textColor=colors.HexColor("#111827"), spaceAfter=1,
        ),
        "meta": ParagraphStyle(
            "CVMeta", parent=base, fontName="CVUnicode", fontSize=10,
            leading=12, textColor=colors.HexColor("#4B5563"), spaceAfter=3,
        ),
        "bullet": ParagraphStyle(
            "CVBullet", parent=base, fontName="CVUnicode", fontSize=9.6,
            leading=12, leftIndent=11, firstLineIndent=-7,
            textColor=colors.HexColor("#1F2937"), spaceAfter=1,
        ),
    }


def section(title: str, content: list, style: dict[str, ParagraphStyle]) -> list:
    # The heading never sits alone at the bottom of a page. A KeepTogether nested in
    # another reports a huge height on purpose (to force a split), so the first
    # block's own pieces are kept together with the heading instead.
    if not content:
        return []
    first = content[0]
    pieces = list(first._content) if isinstance(first, KeepTogether) else [first]
    return [KeepTogether([paragraph(title, style["heading"]), *pieces]), *content[1:]]


def experience_block(item: dict[str, object], style: dict[str, ParagraphStyle]) -> list:
    """A role may break across pages, but its title, dates and first lines stay together."""
    role_line = f"{item['company']} - {item['position']}"
    dates_line = f"{item['location']} | {item['period']}"
    lead = [paragraph(role_line, style["role"]), paragraph(dates_line, style["meta"])]
    rest = []
    if item.get("description"):
        lead.append(paragraph(str(item["description"]), style["body"]))
    bullets = [paragraph(f"• {highlight}", style["bullet"]) for highlight in item["highlights"]]
    if bullets:
        lead.append(bullets[0])
        rest = bullets[1:]
    return [KeepTogether(lead), *rest, Spacer(1, 2)]


def build_pdf(locale: str, content: dict[str, object]) -> Path:
    output = OUTPUT_DIRECTORY / f"{locale}.pdf"
    style = styles()
    # Some parsers and AI screeners read the metadata too: a plain name and title,
    # the headline as subject and the skill groups' terms as keywords.
    keywords = ", ".join(
        term.strip(" .")
        for line in content["skills"]
        for term in str(line).split(":", 1)[-1].replace(";", ",").split(",")
        if term.strip(" .")
    )
    document = SimpleDocTemplate(
        str(output), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
        title=f"{str(content['name']).title()} - {content['headline']}",
        author=str(content["name"]).title(), subject=str(content["headline"]), keywords=keywords,
    )
    story = [
        paragraph(str(content["name"]), style["name"]),
        paragraph(str(content["headline"]), style["headline"]),
        paragraph(" | ".join(content["contact"]), style["contact"]),
    ]
    labels = content["labels"]
    story.extend(section(str(labels["profile"]), [paragraph(str(content["profile"]), style["body"])], style))
    story.extend(section(str(labels["skills"]), [paragraph(str(skill), style["body"]) for skill in content["skills"]], style))
    story.extend(section(str(labels["experience"]), [part for item in content["experience"] for part in experience_block(item, style)], style))
    if content.get("projects"):
        story.extend(section(str(labels["projects"]), [paragraph(f"• {item}", style["body"]) for item in content["projects"]], style))
    story.extend(section(str(labels["education"]), [paragraph(str(item), style["body"]) for item in content["education"]], style))
    story.extend(section(str(labels["certifications"]), [paragraph(str(item), style["body"]) for item in content["certifications"]], style))
    story.extend(section(str(labels["languages"]), [paragraph(str(item), style["body"]) for item in content["languages"]], style))
    document.build(story, canvasmaker=DeterministicCanvas)
    return output


def main() -> None:
    register_fonts()
    with CONTENT_PATH.open(encoding="utf-8") as content_file:
        localized_content = json.load(content_file)
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    for locale in ("pt", "en", "es"):
        output = build_pdf(locale, localized_content[locale])
        if not output.is_file() or output.stat().st_size == 0:
            raise RuntimeError(f"Failed to generate a non-empty PDF: {output}")
        print(output.relative_to(ROOT))


if __name__ == "__main__":
    main()
