"""Guest user setup script."""

from tempfile import NamedTemporaryFile
import requests
from pathlib import Path
import sys

path_root = Path(__file__).parents[1]
sys.path.append(str(path_root))


from src import db
from src.qdrant import add_points
from src.encoder import open_pdf


def main():
    with db.SessionLocal() as sess:
        guest = sess.get(db.User, "guest")
        if guest is not None:
            return
        guest = db.User(user_id="guest", email="guest")
        sess.add(guest)

        resp = requests.get(
            "https://www.postgresql.org/files/documentation/pdf/17/postgresql-17-US.pdf"
        )
        with NamedTemporaryFile() as temp:
            temp.write(resp.content)
            temp.seek(0)
            chunks = open_pdf(temp)
            sess.commit()
            pdf = db.PDFFiles(
                file_name="PostgreSQL 17.pdf", user_id="guest", blob=resp.content
            )
            sess.add(pdf)
            sess.commit()
        points = []
        for chunk in chunks:
            text_chunk = db.TextChunk(
                file_id=pdf.file_id,
                text=chunk["chunk"],
                token_count=chunk["chunk_token_count"],
                word_count=chunk["chunk_word_count"],
            )
            sess.add(text_chunk)
            sess.commit()
            points.append(
                {
                    "id": text_chunk.chunk_id,
                    "user_id": "guest",
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


if __name__ == "__main__":
    main()
