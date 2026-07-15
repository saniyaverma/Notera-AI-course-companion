import os
import uuid
from pypdf import PdfReader
import docx
from app.core.config import settings


def extract_text_from_pdf(path: str) -> str:
    reader = PdfReader(path)
    text_parts = []
    for page in reader.pages:
        text_parts.append(page.extract_text() or "")
    return "\n".join(text_parts)


def extract_text_from_docx(path: str) -> str:
    document = docx.Document(path)
    return "\n".join(p.text for p in document.paragraphs)


def extract_text(path: str, file_type: str) -> str:
    file_type = file_type.lower()
    if file_type == "pdf":
        return extract_text_from_pdf(path)
    if file_type in ("docx", "doc"):
        return extract_text_from_docx(path)
    if file_type == "txt":
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    raise ValueError(f"Unsupported file type: {file_type}")


def extract_images_from_pdf(path: str, course_id: str) -> list[dict]:
    """Extracts embedded images from a PDF and saves them to disk.
    Returns list of {image_path, page_number}.
    """
    results = []
    out_dir = os.path.join(settings.UPLOAD_DIR, "diagrams", course_id)
    os.makedirs(out_dir, exist_ok=True)

    try:
        reader = PdfReader(path)
        for page_num, page in enumerate(reader.pages, start=1):
            try:
                images = page.images
            except Exception:
                continue
            for img in images:
                try:
                    ext = img.name.split(".")[-1] if "." in img.name else "png"
                    filename = f"{uuid.uuid4().hex}.{ext}"
                    out_path = os.path.join(out_dir, filename)
                    with open(out_path, "wb") as f:
                        f.write(img.data)

                    # Skip tiny images (icons/bullets), keep meaningful diagrams
                    if len(img.data) < 5000:
                        os.remove(out_path)
                        continue

                    results.append({
                        "image_path": out_path,
                        "page_number": page_num,
                    })
                except Exception:
                    continue
    except Exception:
        pass

    return results
