from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile
from tempfile import NamedTemporaryFile

import pydantic
import sqlalchemy as sa

from src import db
from src.dependency import (
    get_db,
    require_user,
    require_user_or_guest,
    require_user_with_access,
)
from src.encoder import embedding_model, open_pdf
from src.qdrant import add_points, delete_points, query_points

ROUTER = APIRouter(prefix="/pdf", tags=["PDF"])


@ROUTER.get("/list")
def list_files(sess=Depends(get_db), user=Depends(require_user_or_guest)):
    """List all PDF files."""
    return user.pdf_files.all() if user else []


class AskRequest(pydantic.BaseModel):
    query: str
    limit: int = 20
    min_token_length: int = pydantic.Field(30, ge=30)


class PointPayload(pydantic.BaseModel):
    file_id: int
    page_number: int
    chunk_word_count: int | float
    chunk_token_count: float
    text: str
    file_name: str


class PointResponse(pydantic.BaseModel):
    id: int
    score: float
    payload: PointPayload


@ROUTER.post("/ask", response_model=list[PointResponse])
def ask(request: AskRequest, user=Depends(require_user_or_guest)):
    resp = query_points(
        request.query, user.user_id, request.min_token_length, limit=request.limit
    )
    return resp.points


@ROUTER.post("")
def upload_file(
    file: UploadFile, sess=Depends(get_db), user=Depends(require_user_with_access)
):
    """Upload a PDF file."""

    with NamedTemporaryFile() as temp:
        temp.write(file.file.read())
        file.file.seek(0)
        temp.seek(0)
        chunks = open_pdf(temp)

    if len(chunks) == 0:
        raise HTTPException(status_code=400, detail="No text found in PDF")

    pdf = db.PDFFiles(
        file_name=file.filename, user_id=user.user_id, blob=file.file.read()
    )
    sess.add(pdf)
    sess.flush()
    points = []
    for chunk in chunks:
        text_chunk = db.TextChunk(
            text=chunk["chunk"],
            token_count=chunk["chunk_token_count"],
            word_count=chunk["chunk_word_count"],
        )
        text_chunk.file = pdf
        sess.add(text_chunk)
        sess.flush()
        points.append(
            {
                "user_id": user.user_id,
                "id": text_chunk.chunk_id,
                "file_id": pdf.file_id,
                "page_number": chunk["page_number"],
                "vector": chunk["embedding"].tolist(),
                "chunk_word_count": chunk["chunk_word_count"],
                "chunk_token_count": chunk["chunk_token_count"],
                "text": chunk["chunk"],
                "file_name": pdf.file_name,
            }
        )
    add_points(points)
    return {"file_id": pdf.file_id}


@ROUTER.get("/{file_id}/blob")
def download_file(
    file_id: int, sess=Depends(get_db), user=Depends(require_user_or_guest)
):
    """Download a PDF file."""
    pdf = sess.get(db.PDFFiles, file_id)
    if not pdf or pdf.user_id != user.user_id:
        raise HTTPException(status_code=404, detail="File not found")
    resp = Response(pdf.blob, media_type="application/pdf")
    resp.headers["Content-Disposition"] = f"attachment; filename={pdf.file_name}"
    return resp


@ROUTER.delete("/{file_id}")
def delete_file(
    file_id: int, sess=Depends(get_db), user=Depends(require_user_with_access)
):
    """Delete a PDF file."""
    pdf = sess.get(db.PDFFiles, file_id)
    if not pdf or pdf.user_id != user.user_id:
        raise HTTPException(status_code=404, detail="File not found")
    subq = pdf.text_chunks.cte()
    chunk_ids = sess.scalars(sa.select(subq.c.chunk_id)).all()
    sess.delete(pdf)
    if len(chunk_ids) > 0:
        delete_points(chunk_ids)
    return {"message": "File deleted"}
