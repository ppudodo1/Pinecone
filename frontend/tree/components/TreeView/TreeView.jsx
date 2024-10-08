import React, { Children } from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import TreeNode from "../TreeNode/TreeNode";
import "./TreeView.css";
const TreeView = () => {
  const [nodes, setNodes] = useState();

  const buildTree = (nodes) => {
    const map = new Map();
    const tree = [];
    nodes.forEach((element, index) => {
      map[element.id] = { ...element, children: [] };
    });
    nodes.forEach((node) => {
      if (node.parent_node_id == null) {
        tree.push(map[node.id]);
      } else {
        map[node.parent_node_id].children.push(map[node.id]);
      }
    });
    return tree;
  };
  const fetchData = async () => {
    const res = await axios.get("http://localhost:4000/nodes/");
    const newData = res.data;
    const tree = buildTree(newData);
    console.log(tree);
    setNodes(tree);
  };
  useEffect(() => {
    fetchData();
    //console.log(nodes);
  }, []);
  if (nodes == undefined || nodes == null) {
    return <h1>Loading...</h1>;
  }

  return (
    <ul>
      {nodes.map((rootNode) => (
        <TreeNode key={rootNode.id} node={rootNode}></TreeNode>
      ))}
    </ul>
  );
};

export default TreeView;
