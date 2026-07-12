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
MARGIN = 18 * mm


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
            leading=14, textColor=colors.HexColor("#166534"), spaceBefore=8,
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "CVBody", parent=base, fontName="CVUnicode", fontSize=10,
            leading=13, textColor=colors.HexColor("#1F2937"), spaceAfter=3,
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
            "CVBullet", parent=base, fontName="CVUnicode", fontSize=10,
            leading=12.5, leftIndent=11, firstLineIndent=-7,
            textColor=colors.HexColor("#1F2937"), spaceAfter=1,
        ),
    }


def section(title: str, content: list, style: dict[str, ParagraphStyle]) -> list:
    return [paragraph(title, style["heading"]), *content]


def experience_block(item: dict[str, object], style: dict[str, ParagraphStyle]) -> KeepTogether:
    role_line = f"{item['company']} - {item['position']}"
    dates_line = f"{item['location']} | {item['period']}"
    block = [
        paragraph(role_line, style["role"]),
        paragraph(dates_line, style["meta"]),
        paragraph(str(item["description"]), style["body"]),
    ]
    block.extend(paragraph(f"• {highlight}", style["bullet"]) for highlight in item["highlights"])
    block.append(Spacer(1, 4))
    return KeepTogether(block)


def build_pdf(locale: str, content: dict[str, object]) -> Path:
    output = OUTPUT_DIRECTORY / f"{locale}.pdf"
    style = styles()
    document = SimpleDocTemplate(
        str(output), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN, title=f"CV - {content['name']}",
        author=str(content["name"]),
    )
    story = [
        paragraph(str(content["name"]), style["name"]),
        paragraph(str(content["headline"]), style["headline"]),
        paragraph(" | ".join(content["contact"]), style["contact"]),
    ]
    labels = content["labels"]
    story.extend(section(str(labels["profile"]), [paragraph(str(content["profile"]), style["body"])], style))
    story.extend(section(str(labels["skills"]), [paragraph(str(skill), style["body"]) for skill in content["skills"]], style))
    story.extend(section(str(labels["experience"]), [experience_block(item, style) for item in content["experience"]], style))
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
