"""Token encoder."""

import io
import re
from tempfile import SpooledTemporaryFile
import fitz
from sentence_transformers import SentenceTransformer
from spacy.lang.en import English

nlp = English()
nlp.add_pipe("sentencizer")
MIN_TOKEN_LENGTH = 30
num_sentence_chunk_size = 10


embedding_model = SentenceTransformer(
    model_name_or_path="all-mpnet-base-v2", device="cpu"
)


def text_formatter(text: str) -> str:
    """Performs minor formatting on text."""
    cleaned_text = text.replace(
        "\n", " "
    ).strip()  # note: this might be different for each doc (best to experiment)
    # Other potential text formatting functions can go here
    return cleaned_text


def split_list(input_list: list, slice_size: int) -> list[list[str]]:
    """
    Splits the input_list into sublists of size slice_size (or as close as possible).
    For example, a list of 17 sentences would be split into two lists of [[10], [7]]
    """
    return [
        input_list[i : i + slice_size] for i in range(0, len(input_list), slice_size)
    ]


def open_pdf(file: SpooledTemporaryFile):
    """Open a PDF file."""
    doc = fitz.open(file)
    result = []
    for page_number, page in enumerate(doc):  # iterate the document pages
        text = page.get_text()  # get plain text encoded as UTF-8
        text = text_formatter(text)
        item = {
            "page_number": page_number + 1,
            "page_char_count": len(text),
            "page_word_count": len(text.split(" ")),
            "page_sentence_count_raw": len(text.split(". ")),
            "page_token_count": len(text) / 4,
            "text": text,
            "original_text": text,
        }
        item["sentences"] = list(nlp(item["text"]).sents)
        # Make sure all sentences are strings
        item["sentences"] = [str(sentence) for sentence in item["sentences"]]
        item["sentence_chunks"] = split_list(
            input_list=item["sentences"], slice_size=num_sentence_chunk_size
        )
        item["num_chunks"] = len(item["sentence_chunks"])
        for chunk in item["sentence_chunks"]:
            joined_chunk = "".join(chunk).replace("  ", " ").strip()
            joined_chunk = re.sub(
                r"\.([A-Z])", r". \1", joined_chunk
            )  # ".A" -> ". A" for any full-stop/capital letter combo
            chunk_token_count = len(joined_chunk) / 4
            if chunk_token_count < MIN_TOKEN_LENGTH:
                continue
            chunk_word_count = len(joined_chunk.split(" "))
            result.append(
                {
                    "page_number": item["page_number"],
                    "chunk": joined_chunk,
                    "chunk_token_count": chunk_token_count,
                    "chunk_word_count": chunk_word_count,
                    "embedding": embedding_model.encode([joined_chunk]),
                }
            )

    return result
