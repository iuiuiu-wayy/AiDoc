#!/bin/bash

python scripts/guest_setup.py
uvicorn src.main:app --reload --host 0.0.0.0 --port 80
