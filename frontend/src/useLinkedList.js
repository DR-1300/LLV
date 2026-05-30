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
        setNodes(newNodes);
        setPositions(prev => {
            const next = {...prev};
            newNodes.forEach(n => {
                if (!next[n.id]){
                    next[n.id] = {
                        x:80+Math.random()*640,
                        y: 80+Math.random()*340,
                    }
                }
            });
            return next;
        })
    }

    useEffect(() =>{
        async function load() {
            const data = await callApi(() => api.getList())
            if (data) syncList(data.list);
        }
        load()
    }, []);

    async function create(){
        if (!inputVal,trim()) return;
        const data = await callApi(() => api.createNode(inputVal.trim()))
        if (data) {
            syncList(data.list);
            setInputVal("")
        }
    }

    async function search(){
        if (!inputVal.trim()) return;
        const data = await callApi(() => api.searchNode(inputVal.trim()))

        if (data){
            setHighlighted(new Set(data.found.map(n=>n.id)))
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
        node,
        positions,
        highlighted,
        mode,
        inputVal,
        error,
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
    }
}