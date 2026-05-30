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

    nodes.forEach(n=> {
      const pos = positions[n.id]
      if (!pos) return;

      const isHighlighted = highlighted.has(n.id)
      const isPending = pendingInsert === n.id

      if (isHighlighted) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, NODE_R +6, 0, Math.PI*2)
        ctx.strokeStyle = 'rgba(212,138,164,0.5)'
        ctx.lineWidth = 2;
        ctx.stroke()
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, NODE_R, 0 , Math.PI*2)
      ctx.fillStyle = isHighlighted ? PEO_D: isPending? PEO: ESP;
      ctx.fill()
      ctx.strokeStyle = isHighlighted || isPending ? ESP:PEO;
      ctx.font = "bold 11px system-ui"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(n.val, pos.x, pos.y)

      if (!n.next) {
        ctx.fillStyle = "rgba(62,39,35,0.4)"
        ctx.font = "9px system-ui"
        ctx.textBaseline = "top"
        ctx.fillText("NULL", pos.x, pos.y + NODE_R + 4)
      }
    })
  }, [nodes, positions, highlighted, pendingInsert])

  function drawArrow(ctx, x1,y1,x2,y2,highlight){
    const dx = x2-x1
    const dy = y2 - y1
    const dist = Math.hypot(dx,dy)
    if (dist<1) return;

    const ux = dx/dist
    const uy = dy/dist

    const sx = x1 + ux + NODE_R
    const sy = y1 + uy + NODE_R

    const ex = x2 - ux * (NODE_R + 5)
    const ey = y2 - uy * (NODE_R + 5)

    ctx.beginPath();
    ctx.moveTo(sx,sy)
    ctx.lineTo(ex,ey)
    ctx.strokeStyle = highlight ? PEO_D : MID;
    ctx.lineWidth = highlight ? 2.2 : 1.6;
    ctx.stroke();

    const angle  = Math.atan2(ey-sy, ex-sx)
    ctx.beginPath()
    ctx.moveTo(ex,ey)
    ctx.lineTo(ex - 9 * Math.cos(angle - 0.38), ey - 9 * Math.sin(angle - 0.38));
    ctx.lineTo(ex - 9 * Math.cos(angle + 0.38), ey - 9 * Math.sin(angle + 0.38));
    ctx.closePath()
    ctx.fillStyle = highlight ? PEO_D :MID
    ctx.fill();
  }

  function nodeAt(x,y){
    for (let i = nodes.length - 1; i>=0; i--){
      const n = nodes[i]
      const pos = positions[n.id]
      if (!pos) continue;
      if (Math.hypot(x-pos.x, y-pos.y) <= NODE_R) return n;
    }
    return null
  }

  function canvasXY(e){
    const rect = canvasRef.current.getBoundingClientRect()
    return { x:e.clientX - rect.left, y:e.clientY - rect.top};
  }

  function handleMouseDown(e){
    if (e.button !== 0) return;
    const {x,y}= canvasXY(e)
    const n = nodeAt(x,y)

    if (n){
      const pos = positions[n.id]
      dragging.current = n.id
      dragOffset.current = { x: x - pos.x, y: y - pos.y };
    }
  }

  function handleMouseMove(e) {
    if (!dragging.current) return;
    const {x,y} = canvasXY(e)

    moveNode(
      dragging.current,
      Math.max(NODE_R + 10, Math.min(canvasRef.current.offsetWidth - NODE_R - 10, x - dragOffset.current.x)),
      Math.max(NODE_R + 10, Math.min(canvasRef.current.offsetHeight - NODE_R - 10, y - dragOffset.current.y))
    );
  }

  function handleMouseUp(){
    dragging.current = null;
  }

  function handleClick(e){
    
    if (connectingFrom !== null) {
      const {x,y} = canvasXY(e)
      const n = nodeAt(x,y)
      if (n && n.id !== connectingFrom){
        connect(connectingFrom, n.id)
      }
      setConnectingFrom(null)
      return;
    }

    const { x,y } = canvasXY(e)
    const n = nodeAt(x,y)
    if (!n) return;
    
    if (mode === "delete") deleteNode(n.id);
    else if (mode === "alter") alter(n.id);
    else if (mode === "insert") startInsert(n.id);
    else if (mode === "search") {}
  }

  function handleRightClick(e) {
    e.preventDefault()
    const {x,y} =  canvasXY(e)
    const n = nodeAt(x,y)

    if (!n) return;

    setCtxMenu({ x: e.clientX, y: e.clientY, nodeId: n.id });
  }

  function handleAction(){
    if (mode ==="create") create();
    else if (mode === "search") search();
    else if (mode === "insert" && pendingInsert) confirmInsert();
    else if (mode === "alter") {};
  }

  const actionLabel = {
    create: "+ Create",
    search: "Search",
    insert: pendingInsert? "Confirm Insert": "Insert After",
    delete: "Click a Node",
    alter: "Click a Node",
  }[mode];

  return (
    // The outermost div fills the whole screen
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: PEO_L }}>
 
      {/* ── header ── */}
      <div style={{ background: ESP, color: PEO, padding: "9px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>⬡ Linked List Visualiser</span>
        <span style={{ fontSize: 11, color: "rgba(244,201,214,.4)", letterSpacing: ".04em" }}>Singly Linked · Intersections Supported</span>
      </div>
 
      {/* ── toolbar ── */}
      <div style={{ background: ESP, borderTop: "1px solid #5a3530", padding: "7px 18px", display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", flexShrink: 0 }}>
 
        {/* Value input */}
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          // pressing Enter triggers the main action
          onKeyDown={e => e.key === "Enter" && handleAction()}
          placeholder="value…"
          maxLength={6}
          style={{ background: "rgba(244,201,214,.1)", border: "1px solid rgba(244,201,214,.28)", color: PEO, fontSize: 12, padding: "4px 9px", borderRadius: 5, width: 80, outline: "none" }}
        />
 
        {/* Main action button */}
        <button onClick={handleAction} disabled={loading}
          style={{ background: PEO, color: ESP, border: "none", fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 5, cursor: "pointer", letterSpacing: ".05em", textTransform: "uppercase" }}>
          {loading ? "…" : actionLabel}
        </button>
 
        <div style={{ width: 1, height: 18, background: "rgba(244,201,214,.18)", margin: "0 2px" }} />
 
        {/* Mode buttons */}
        {["insert", "search", "delete", "alter"].map(m => (
          <button key={m} onClick={() => { setMode(m); clearHighlighted(); }}
            style={{ background: mode === m ? "rgba(244,201,214,.15)" : "transparent", border: `1px solid ${mode === m ? PEO : "rgba(244,201,214,.3)"}`, color: PEO, fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 5, cursor: "pointer", letterSpacing: ".05em", textTransform: "uppercase" }}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
 
        <div style={{ width: 1, height: 18, background: "rgba(244,201,214,.18)", margin: "0 2px" }} />
 
        <button onClick={() => { /* clear all is a backend reset — implement as needed */ }}
          style={{ background: "transparent", border: "1px solid rgba(244,201,214,.3)", color: PEO_D, fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 5, cursor: "pointer", letterSpacing: ".05em", textTransform: "uppercase" }}>
          Clear
        </button>
      </div>
 
      {/* ── main area: canvas + code panel ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
 
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{ flex: 1, display: "block", cursor: connectingFrom ? "crosshair" : "default" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          onContextMenu={handleRightClick}
        />
 
        {/* Code panel */}
        <div style={{ width: 280, background: ESP, display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(244,201,214,.15)", flexShrink: 0 }}>
          <div style={{ fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "rgba(244,201,214,.4)", padding: "10px 14px 2px" }}>Current Operation</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: PEO, padding: "2px 14px 10px", borderBottom: "1px solid rgba(244,201,214,.1)" }}>
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </div>
          <pre style={{ flex: 1, overflow: "auto", padding: 14, fontFamily: "'Courier New', monospace", fontSize: 11, lineHeight: 1.65, color: PEO, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
            {CODE[mode] || "# select a mode"}
          </pre>
        </div>
      </div>
 
      {/* ── status bar ── */}
      <div style={{ background: "#2a1a18", color: "rgba(244,201,214,.5)", fontSize: 10, padding: "4px 16px", flexShrink: 0, display: "flex", gap: 12 }}>
        <span>Mode: <b style={{ color: PEO }}>{mode}</b></span>
        <span>Nodes: <b style={{ color: PEO }}>{nodes.length}</b></span>
        {error && <span style={{ color: "#e8a8bc" }}>⚠ {error}</span>}
        {pendingInsert && <span style={{ color: PEO_D }}>Click confirm or type value</span>}
        {connectingFrom && <span style={{ color: PEO_D }}>Click a target node to connect</span>}
      </div>
 
      {/* ── right-click context menu ── */}
      {ctxMenu && (
        // Clicking outside the menu closes it
        <div onClick={() => setCtxMenu(null)}
          style={{ position: "fixed", inset: 0, zIndex: 99 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ position: "fixed", left: ctxMenu.x, top: ctxMenu.y, background: ESP, border: "1px solid rgba(244,201,214,.3)", borderRadius: 8, overflow: "hidden", zIndex: 100, minWidth: 155, boxShadow: "0 4px 20px rgba(0,0,0,.4)" }}>
            {[
              // Each entry: [ label, onClick handler ]
              ["⇢ Connect to…", () => { setConnectingFrom(ctxMenu.nodeId); setCtxMenu(null); }],
              ["✕ Disconnect", () => { disconnect(ctxMenu.nodeId); setCtxMenu(null); }],
              null, // null = separator line
              ["✎ Alter value", () => { setMode("alter"); setCtxMenu(null); }],
              ["⊘ Delete", () => { deleteNode(ctxMenu.nodeId); setCtxMenu(null); }],
            ].map((item, i) =>
              item === null
                ? <div key={i} style={{ height: 1, background: "rgba(244,201,214,.13)" }} />
                : <button key={i} onClick={item[1]}
                    style={{ display: "block", width: "100%", background: "none", border: "none", color: i === 4 ? PEO_D : PEO, fontSize: 12, padding: "8px 14px", textAlign: "left", cursor: "pointer" }}>
                    {item[0]}
                  </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}