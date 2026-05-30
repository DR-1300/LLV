import { useRef, useEffect, useState } from "react"
import { useLinkedList } from "./useLinkedList"

const ESP = "#3E2723";
const PEO = "#F4C9D6";
const PEO_D = "#e8a8bc";
const PEO_L = "#fdf0f4";   
const MID = "#c49aab";      
const NODE_R = 28; 

const CODE = {
  create: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None
 
def create(self, val):
    new_node = Node(val)
    if not self.head:
        self.head = new_node
        return
    curr = self.head
    while curr.next:
        curr = curr.next
    curr.next = new_node`,
 
  search: `def search(self, val):
    curr = self.head
    index = 0
    while curr:
        if curr.val == val:
            return (curr, index)
        curr = curr.next
        index += 1
    return None`,
 
  delete: `def delete(self, node_id):
    target = self._nodes.get(node_id)
    if not target:
        return False
    for n in self._nodes.values():
        if n.next and n.next.id == node_id:
            n.next = target.next
    if self.head.id == node_id:
        self.head = target.next
    del self._nodes[node_id]
    return True`,
 
  insert: `def insert_after(self, node_id, new_val):
    target = self._nodes.get(node_id)
    if not target:
        return None
    new_node = Node(new_val, self._next_id())
    new_node.next = target.next
    target.next = new_node
    return new_node.to_dict()`,
 
  alter: `def alter(self, node_id, new_val):
    target = self._nodes.get(node_id)
    if not target:
        return None
    target.val = new_val
    return target.to_dict()`,
};

export default function App(){
  const {
    nodes, positions, highlighted,
    mode, setMode,
    inputVal, setInputVal,
    error, loading, pendingInsert,
    create, search, deleteNode,
    startInsert, confirmInsert,
    alter, connect, disconnect, moveNode,
    clearHighlighted,
  } = useLinkedList();

  const canvasRef = useRef(null)

  const [ctxMenu, setCtxMenu] = useState(null)
  const [connectingFrom, setConnectingFrom] = useState(null)

  const dragging = useRef(null)
  const dragOffset = useRef({x:0,y:0})

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d")

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    ctx.clearRect(0,0,canvas.width, canvas.height)

    ctx.fillStyle = PEO_L;
    ctx.fillRect(0,0,canvas.width, canvas.height)

    ctx.strokeStyle = "rgba(244,201,214,0.3)"
    ctx.lineWidth = 0.5;

    for (let x = 0; x<canvas.width; x+=40){
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x, canvas.height); ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    if (nodes.length ===0){
      ctx.fillStyle = "rgba(62,39,35,0.22)"
      ctx.font ="14px system-ui"
      ctx.textAlign = "center"
      ctx.fillText("Type a value and click + Create", canvas.width/2, canvas.height/2)
      return;
    }

    nodes.forEach(n=> {
      if (!n.next) return;
      const from = positions[n.id]
      const to = positions[n.next];
      if (!from || !to) return;
      drawArrow(ctx, from.x, from.y, to.x, to.y,
        highlighted.has(n.id) || highlighted.has(n.next)
      )
    })
  })
}