# Linked List Visualiser

[Live demo](https://youtu.be/Eb9dLVi50oE)

An interactive singly linked list visualiser built with React and FastAPI.
Supports intersections, drag-and-drop nodes, and animated search traversal.

## Features
- Create, search, delete, insert, and alter nodes
- Drag nodes freely on the canvas
- Right-click any node to connect, disconnect, alter, or delete
- Animated search — watches the traversal node by node
- Live Python code panel showing the implementation of each operation

## Tech Stack
- **Frontend:** React (Vite), HTML Canvas
- **Backend:** Python, FastAPI

## Running Locally

### Backend
cd backend
pip install fastapi[standard]
fastapi dev main.py

### Frontend
cd frontend
npm install
npm run dev

Frontend runs on http://localhost:5173
Backend runs on http://localhost:8000
API docs at http://localhost:8000/docs
