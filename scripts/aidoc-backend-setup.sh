#!/bin/bash

# Name of the tmux session
SESSION_NAME="backend-aidoc-setup"
WORKING_DIR="/home/wayy/personal/JournalView"
BAKCEND_DIR="${WORKING_DIR}/backend"
FRONTEND_DIR="${WORKING_DIR}/frontend"
# Check if the session already exists
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "Session $SESSION_NAME already exists. Attaching..."
    tmux attach -t $SESSION_NAME
    exit 0
fi

# Start a new tmux session
tmux new-session -d -s $SESSION_NAME
tmux new-window -t $SESSION_NAME:1 -n 'server'
tmux send-keys -t $SESSION_NAME:1 "cd $BAKCEND_DIR" C-m
tmux send-keys -t $SESSION_NAME:1 "source .venv/bin/activate" C-m
# tmux send-keys -t $SESSION_NAME:1 "uvicorn src.main:app --reload --port 8000" C-m
#
# tmux split-window -h -t $SESSION_NAME:1
# tmux send-keys -t $SESSION_NAME:1 "cd $BAKCEND_DIR" C-m
# tmux send-keys -t $SESSION_NAME:1 "source .venv/bin/activate" C-m
tmux new-window -t $SESSION_NAME:2 -n 'ui'
tmux send-keys -t $SESSION_NAME:2 "cd $FRONTEND_DIR" C-m

tmux new-window -t $SESSION_NAME:3 -n 'compose-up'
tmux send-keys -t $SESSION_NAME:3 "docker compose up -d" C-m

tmux send-keys -t $SESSION_NAME:1 "docker attach aidoc-api" C-m

tmux new-window -t $SESSION_NAME:4 -n 'code-env'
tmux send-keys -t $SESSION_NAME:4 "cd $WORKING_DIR" C-m
tmux send-keys -t $SESSION_NAME:4 "source ${BAKCEND_DIR}/.venv/bin/activate" C-m
tmux send-keys -t $SESSION_NAME:4 "nvim ." C-m

# Attach to the tmux session
tmux attach -t $SESSION_NAME
