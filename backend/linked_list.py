class Node:
    def __init__(self, val:str, node_id:int):
        self.id = node_id
        self.val =val
        self.next: "Node | None" = None
    def to_dict(self): # info of the node
        return{
            "id": self.id,
            "val": self.val,
            "next":self.next.id if self.next else None,
        }
# just learnt about the convention of _ as private helpers.. im using them everywhere
class LinkedList:
    def __init__(self):
        self.head: Node | None=None
        self._id_seq=1
        self._nodes: dict[int, Node]={} #instant lookup cuz its my app so O{1} btw its tempting
    
    def _next_id(self):
        nid = self._id_seq
        self._id_seq +=1
        return nid
    
    def to_dict(self):
        return [n.to_dict() for n in self._nodes.values()]
    
    def create(self, val:str):
        new_node = Node(val, self._next_id())
        self._nodes[new_node.id] = new_node

        #just finding the tail of the linked list to add the new node
        if not self.head:
            self.head = new_node 
        else:
            curr=self.head
            while curr.next:
                curr = curr.next
            curr.next = new_node
        return new_node.to_dict() # for the API response
    
    def search(self, val:str):
        return [n.to_dict() for n in self._nodes.values() if n.val == val] # supports duplicates cuz people can make duplicates why not?
    
    def delete(self, node_id:int):
        target = self._nodes.get(node_id)

        if not target:
            return False
        
        for n in self._nodes.values():
            if n.next and n.next.id == node_id:
                n.next = target.next # skips the target node, hence its left out haha
        
        if self.head and self.head.id == node_id: # what if target is the head
            self.head = target.next
        
        del self._nodes[node_id]

        return True # that means it has been deleted
    
    def insert_after(self, node_id: int, new_val: str):
        target = self._nodes.get(node_id) # to find the node we insert after

        if not target:
            return None # we just cant insert it , so return None
        
        new_node = Node(new_val, self._next_id())

        self._nodes[new_node.id] = new_node

        new_node.next = target.next
        target.next = new_node
        return new_node.to_dict()
    
    def alter(self, node_id:int, new_val:str):
        target = self._nodes.get(node_id)
        if not target:
            return None
        
        target.val = new_val
        return target.to_dict()
    
    def connect(self, from_id:int, to_id:int):

        src = self._nodes.get(from_id)
        dst = self._nodes.get(to_id)

        if not src or not dst:
            return False
        src.next = dst

        return True
    
    def disconnect(self, node_id:int):
        target = self._nodes.get(node_id)

        if not target:
            return False
        
        target.next = None

        return True