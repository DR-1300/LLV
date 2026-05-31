import { useState, useEffect, use } from "react";
import * as api from "./api";

export function useLinkedList(){
    const [nodes, setNodes] = useState([]);

    const [highlighted, setHighlighted] = useState(new Set());

    const [mode, setMode] = useState("create");

    const [inputVal, setInputVal] = useState("");

    const [pendingInsert, setPendingInsert] = useState(null);

    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);

    const [positions, setPositions] = useState({});

    async function callApi(fn) {
        setLoading(true);
        setError(null);
        try{
            const result = await fn();
            return result;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false)
        }
    }
    function syncList(newNodes) {
        if (!newNodes) return;
        setNodes(newNodes);
        setPositions(prev => {
            const next = { ...prev };
            newNodes.forEach(n => {
            if (!next[n.id]) {
                next[n.id] = {
                x: 80 + Math.random() * 640,
                y: 80 + Math.random() * 340,
                };
            }
            }); 
        return next;
    });
    }          
    useEffect(() =>{
        async function load() {
            const data = await callApi(() => api.getList())
            if (data) syncList(data.list);
        }
        load()
    }, []);

    async function create(){
        if (!inputVal.trim()) return;
        const data = await callApi(() => api.createNode(inputVal.trim()))
        if (data) {
            syncList(data.list);
            setInputVal("")
        }
    }

    async function search() {
    if (!inputVal || !inputVal.trim()) return;
    const val = inputVal.trim();

    const pointedTo = new Set(nodes.map(n => n.next).filter(Boolean));
    const headNode = nodes.find(n => !pointedTo.has(n.id));
    if (!headNode) return;

    const order = [];
    let curr = headNode;
    const visited = new Set();
    while (curr && !visited.has(curr.id)) {
        order.push(curr);
        visited.add(curr.id);
        curr = nodes.find(n => n.id === curr.next) || null;
    }

    setHighlighted(new Set());

    let foundId = null;

    for (let i = 0; i < order.length; i++) {
        // flash this node on
        setHighlighted(new Set([order[i].id]));
        await new Promise(res => setTimeout(res, 500));

        if (order[i].val === val) {
            foundId = order[i].id;
            break;
        }

        // flash off before moving to next
        setHighlighted(new Set());
        await new Promise(res => setTimeout(res, 150));
    }

    if (foundId !== null) {
        // leave only the found node highlighted
        setHighlighted(new Set([foundId]));
    } else {
        setHighlighted(new Set());
        setError(`Value "${val}" not found`);
    }
}

    async function deleteNode(id) {
        const data = await callApi(() => api.deleteNode(id))
        if (data) {
            syncList(data.list)

            setPositions(prev => {
                const next = {...prev}
                delete next[id]
                return next;
            })
            highlighted.delete(id);
            setHighlighted(new Set(highlighted))
        }
    }

    function startInsert(id){
        setPendingInsert(id)
    }

    async function confirmInsert() {
        if (!pendingInsert || !inputVal.trim()) return;
        const data = await callApi(()=>
        api.insertAfter(pendingInsert, inputVal.trim())
    )
    if (data) {
        syncList(data.list);
        setInputVal("")
        setPendingInsert(null)
    }
    }

    async function alter(id){
        if (!inputVal.trim()) return;
        const data = await callApi(() => api.alterNode(id, inputVal.trim()))
        if (data) {
            setNodes(prev => 
                prev.map(n=> (n.id ===id ? {...n, val:inputVal.trim()}:n))
            )
            setInputVal("")
        }
    }
    async function clearAll() {
        await callApi(() => api.clearList());
        setNodes([]);
        setPositions({});
        setHighlighted(new Set());
        setPendingInsert(null);
        setError(null);
    }

    async function connect(fromId, toId){
        const data = await callApi(() => api.connectNodes(fromId, toId))
        if (data) syncList(data.list)
    }

    async function disconnect(id) {
        const data = await callApi(() => api.disconnectNode(id))
        if (data) syncList(data.list);
    }

    function moveNode(id, x,y){
        setPositions(prev => ({ ...prev, [id]: {x,y}}))
    }

    function clearHighlighted(){
        setHighlighted(new Set())
    }

    return {
        nodes,
        positions,
        highlighted,
        mode,
        inputVal,
        error,
        setError, 
        loading,
        pendingInsert,
        setMode,
        setInputVal,
        clearHighlighted,
        create,
        search,
        deleteNode,
        startInsert,
        confirmInsert,
        alter,
        connect,
        disconnect,
        moveNode,
        clearAll
    }
}