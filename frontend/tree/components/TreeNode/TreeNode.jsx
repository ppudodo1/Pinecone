import React, { useState } from "react";
import "./TreeNode.css";
import axios from "axios";

const TreeNode = ({ node }) => {
  const [checkAdd, setCheckAdd] = useState(false);
  const [checkEdit, setCheckEdit] = useState(false);
  const [newNodeValue, setNewNodeValue] = useState("");
  const [editNodeValue, setEditNodeValue] = useState("");
  const addNewNode = async (newNodeValue, parentId) => {
    const res = await axios.post(
      `http://localhost:4000/nodes/newNode/${parentId}/${newNodeValue}`
    );
    window.location.reload();
  };
  const editTreeNode = async (newValue, id) => {
    const res = await axios.put(
      `http://localhost:4000/nodes/edit/${id}/${newValue}`
    );
    window.location.reload();
  };
  const deleteTreeNode = async () => {
    const res = await axios.delete(
      `http://localhost:4000/nodes/delete/${node.id}`
    );
    window.location.reload();
  };
  const moveNode = async (e, parentId) => {
    e.stopPropagation();
    let id = localStorage.getItem("nodeId");
    console.log("Parent id", parentId);
    const res = await axios.put(
      `http://localhost:4000/nodes/transferNode/${id}/${parentId}`
    );
    window.location.reload();
  };
  const startDrag = (e, nodeId) => {
    e.stopPropagation();
    console.log(node.id);
    localStorage.setItem("nodeId", node.id);
  };
  const allowDrop = (e) => {
    e.preventDefault();
  };

  return (
    <li
      draggable
      onDragStart={(e) => startDrag(e, node.id)}
      onDrop={(e) => moveNode(e, node.id)}
      onDragOver={allowDrop}
    >
      <details>
        <summary>
          {node.title}
          <button onClick={() => setCheckAdd(!checkAdd)}>Add</button>
          {node.id === 1 ? (
            <></>
          ) : (
            <button onClick={() => deleteTreeNode()}>Delete</button>
          )}

          <button onClick={() => setCheckEdit(!checkEdit)}>Edit</button>
          <br />
          {checkAdd == true && (
            <div>
              <input
                placeholder="Add new node"
                onChange={(e) => setNewNodeValue(e.target.value)}
              ></input>
              <button onClick={() => addNewNode(newNodeValue, node.id)}>
                Confirm
              </button>
            </div>
          )}
          {checkEdit == true && (
            <div>
              <input
                placeholder="Edit node value"
                onChange={(e) => setEditNodeValue(e.target.value)}
              ></input>
              <button onClick={() => editTreeNode(editNodeValue, node.id)}>
                Confirm
              </button>
            </div>
          )}
        </summary>

        {node.children.length > 0 && (
          <ul>
            {node.children.map((childNode) => (
              <TreeNode key={childNode.id} node={childNode} />
            ))}
          </ul>
        )}
      </details>
    </li>
  );
};

export default TreeNode;
