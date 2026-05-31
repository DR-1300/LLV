from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from linked_list import LinkedList

app = FastAPI(title="Linked List Visualiser")


app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_methods=["*"],
    allow_headers=['*'],
)

ll = LinkedList()

class CreateBody(BaseModel):
    val: str

class InsertBody(BaseModel):
    new_val:str
class AlterBody(BaseModel):
    new_val:str

@app.get("/")
def root():
    return {"message": "Linked ListAPI is running"}

@app.post("/node", status_code = 201)
def create_node(body: CreateBody):
    node = ll.create(body.val)
    return {"message": f"Node '{body.val}' created", "node": node, "list": ll.to_dict()}

@app.get("/search")
def search_node(val:str):
    results = ll.search(val)
    if not results:
        raise HTTPException(status_code=404, detail=f"Value '{val}' not found")
    return {"found": results, "count": len(results)}

@app.delete("/node/{node_id}")
def delete_node(node_id: int):
    success = ll.delete(node_id) # cuz it gives either true or false

    if not success:
        raise HTTPException(status_code=404, detail = f"Node ID {node_id} not found")
    return {"message": f"Node {node_id} deleted", "list": ll.to_dict()}

@app.post("/node/{node_id}/insert")
def insert_after(node_id: int, body: InsertBody):
    new_node=ll.insert_after(node_id, body.new_val)
    if not new_node:
        raise HTTPException(status_code=404, detail=f"Node id {node_id} not found")
    return {"message": f"Inserted '{body.new_val}' after node {node_id}", "new_node": new_node, "list": ll.to_dict()}

@app.patch("/node/{node_id}")
def alter_node(node_id: int, body: AlterBody):
    updated = ll.alter(node_id, body.new_val)

    if not updated:
        raise HTTPException(status_code=404, detail=f"Node id {node_id} not found")
    
    return {"message": f"Node {node_id} updated to '{body.new_val}'", "node": updated}

@app.get("/list")
def get_list():
    return {"list": ll.to_dict()}

@app.patch("/node/{from_id}/connect/{to_id}")
def connect_nodes(from_id: int, to_id: int):
    success = ll.connect(from_id, to_id)
    if not success:
        raise HTTPException(status_code = 404, detail="One or both node ids not found")
    
    return {"message": f"Node {from_id} now points to {to_id}", "list": ll.to_dict()}

@app.delete("/clear")
def clear_list():
    ll._nodes.clear()
    ll.head = None
    ll._id_seq = 1
    return {"message": "List cleared"}

@app.patch("/node/{node_id}/disconnect")
def disconnect_nodes(node_id: int):
    success = ll.disconnect(node_id)

    if not success:
        raise HTTPException(status_code=404, detail=f"Node id {node_id} not found")
    
    return {"message": f"Node {node_id} disconnected", "list": ll.to_dict()}