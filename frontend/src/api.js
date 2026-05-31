const Base = "http://localhost:8000"

async function request(path, options = {}) {
    const response = await fetch(`${Base}${path}`, {
        headers: {"Content-Type": "application/json"},
        ...options,
    })    

    const data = await response.json()

    if(!response.ok){
        throw new Error(data.detail || "Something went wrong");
    }

    return data
}

export async function createNode(val) {
  return request("/node", {
    method: "POST",
    body: JSON.stringify({ val }),
  });
}

export async function searchNode(val) {
    return request(`/search?val=${encodeURIComponent(val)}`);
}
export async function deleteNode(id) {
  return request(`/node/${id}`, {
    method: "DELETE",
  });
}

export async function insertAfter(id, newVal) {
  return request(`/node/${id}/insert`, {
    method: "POST",
    body: JSON.stringify({ new_val: newVal }),
  });
}
export async function alterNode(id, newVal) {
  return request(`/node/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ new_val: newVal }),
  });
}
export async function clearList() {
    return request("/clear", { method: "DELETE" });
}
export async function getList() {
  return request("/list");
}
export async function connectNodes(fromId, toId) {
  return request(`/node/${fromId}/connect/${toId}`, {
    method: "PATCH",
  });
}
 
export async function disconnectNode(id) {
  return request(`/node/${id}/disconnect`, {
    method: "PATCH",
  });
}