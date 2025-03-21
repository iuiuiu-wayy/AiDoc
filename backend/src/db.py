from sqlalchemy import (
    Column,
    ForeignKey,
    Index,
    Integer,
    LargeBinary,
    String,
    create_engine,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, mapped_column, Mapped
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[str] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(nullable=False)

    pdf_files: Mapped[list["PDFFiles"]] = relationship(
        "PDFFiles", back_populates="user", lazy="dynamic"
    )


class PDFFiles(Base):
    __tablename__ = "pdf_files"

    file_id: Mapped[int] = mapped_column(primary_key=True)
    file_name: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    blob: Mapped[bytes] = mapped_column(nullable=False, deferred=True)

    user: Mapped[User] = relationship("User", back_populates="pdf_files")
    text_chunks: Mapped[list["TextChunk"]] = relationship(
        "TextChunk", back_populates="file", lazy="dynamic"
    )

    __table_args__ = (Index("PDFFiles_user_id_file_name", "user_id", "file_name"),)


class TextChunk(Base):
    __tablename__ = "text_chunks"

    chunk_id: Mapped[int] = mapped_column(primary_key=True)
    file_id: Mapped[int] = mapped_column(
        ForeignKey("pdf_files.file_id"), nullable=False
    )
    text: Mapped[str] = mapped_column(nullable=False)
    token_count: Mapped[int] = mapped_column(nullable=False)
    word_count: Mapped[int] = mapped_column(nullable=False)

    file: Mapped[PDFFiles] = relationship("PDFFiles", back_populates="text_chunks")

    __table_args__ = (Index("TextChunk_file_id_chunk_id", "file_id", "chunk_id"),)


# Database setup
DATABASE_URL = "sqlite:///./test.db"  # Replace with your actual database URL
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
