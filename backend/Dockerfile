FROM python:3.12.4-slim

RUN pip install poetry

WORKDIR /backend

COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false

RUN poetry install --no-root 
