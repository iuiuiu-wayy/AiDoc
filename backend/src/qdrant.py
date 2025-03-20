"""Qdrant utility functions."""

from typing import Optional
from qdrant_client import models, QdrantClient

from src.encoder import embedding_model

COLLECTION_NAME = "pdfs"
client = QdrantClient(":memory:")
collenction_exists = client.collection_exists(collection_name=COLLECTION_NAME)
if not collenction_exists:
    client.create_collection(
        COLLECTION_NAME,
        vectors_config=models.VectorParams(
            size=embedding_model.get_sentence_embedding_dimension(),
            distance=models.Distance.DOT,
        ),
    )


def add_points(items: list[dict]):
    """Add points to Qdrant."""
    client.upload_points(
        collection_name=COLLECTION_NAME,
        points=[
            models.PointStruct(
                id=item["id"],
                vector=item["vector"],
                payload={
                    "user_id": item["user_id"],
                    "file_id": item["file_id"],
                    "page_number": item["page_number"],
                    "chunk_word_count": item["chunk_word_count"],
                    "chunk_token_count": item["chunk_token_count"],
                    "text": item["text"],
                    "file_name": item["file_name"],
                },
            )
            for item in items
        ],
    )


def query_points(
    query: str,
    team_id: str,
    min_token_length: int = 30,
    payload: Optional[dict] = None,
    limit=20,
):
    """Query points in Qdrant."""
    payload = payload or {}
    hits = client.query_points(
        collection_name=COLLECTION_NAME,
        query=embedding_model.encode(query).tolist(),
        limit=limit,
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="user_id", match=models.MatchValue(value=team_id)
                ),
                models.FieldCondition(
                    key="chunk_token_count",
                    range=models.Range(gte=min_token_length),
                ),
                *[
                    models.FieldCondition(key=key, match=models.MatchValue(value=value))
                    for key, value in payload.items()
                ],
            ]
        ),
    )
    return hits
