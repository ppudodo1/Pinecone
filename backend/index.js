import express from "express";
import cors from "cors";
import fs from "fs";
const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = "data.json";
class Node {
  constructor(id, title, parent_node_id, ordering) {
    this.id = id;
    this.title = title;
    this.parent_node_id = parent_node_id;
    this.ordering = ordering;
  }
}

const readData = () => {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
};
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
};

app.get("/nodes", (req, res) => {
  const nodes = readData();
  res.status(200).json(nodes);
});
app.post("/nodes/newNode/:parentId/:value", (req, res) => {
  let value = req.params.value;
  const nodes = readData();
  const arrOfIndex = nodes.map((node) => node.id);
  let id = arrOfIndex[arrOfIndex.length - 1] + 1;
  let parentId = parseInt(req.params.parentId);
  let ordering = 1;
  let newNode = new Node(id, value, parentId, ordering);
  nodes.push(newNode);
  fs.writeFileSync(DATA_FILE, JSON.stringify(nodes, null, 2), () => {});
  res.status(200).json("Success");
});
app.put("/nodes/edit/:id/:newValue", (req, res) => {
  const id = req.params.id;
  const editValue = req.params.newValue;
  const nodes = readData();
  const nodeIndex = nodes.findIndex((node) => node.id == id);
  if (nodeIndex !== -1) {
    nodes[nodeIndex].title = editValue;
    writeData(nodes);
    res.status(200).json(nodes[nodeIndex]);
  } else {
    res.status(404).json({ message: "Node not found" });
  }
});
const recursiveDelete = (nodeId, nodes) => {
  let nodesToDelete = [nodeId];
  const children = nodes.filter((node) => node.parent_node_id === nodeId);
  children.forEach((child) => {
    nodesToDelete = nodesToDelete.concat(recursiveDelete(child.id, nodes));
  });

  return nodesToDelete;
};

app.delete("/nodes/delete/:id", (req, res) => {
  const nodes = readData();
  const nodeId = parseInt(req.params.id);
  let idForDeletion = recursiveDelete(nodeId, nodes);
  let indexesToDelete = [];
  idForDeletion.forEach((num) => {
    let findIndex = nodes.findIndex((node) => node.id === num);
    indexesToDelete.push(findIndex);
  });

  indexesToDelete.sort((a, b) => b - a);
  console.log(indexesToDelete);
  indexesToDelete.forEach((index) => {
    nodes.splice(index, 1);
  });
  writeData(nodes);
  res.status(200).json(idForDeletion);
});
app.put("/nodes/transferNode/:id/:newParentId", (req, res) => {
  const nodes = readData();
  let id = parseInt(req.params.id);
  let newParentId = parseInt(req.params.newParentId);
  let indexOfNode = nodes.findIndex((node) => node.id == id);
  const recursiveCheck = (parentId, targetId) => {
    if (parentId === targetId) return true;
    const parent = nodes.find((node) => node.id === parentId);
    if (!parent || parent.parent_node_id == null) return false;
    return recursiveCheck(parent.parent_node_id, targetId);
  };
  if (recursiveCheck(newParentId, id)) {
    return res.status(400).json({ message: "Invalid action" });
  } else {
    nodes[indexOfNode].parent_node_id = newParentId;
    writeData(nodes);
    res.status(200).json(nodes);
  }
});
app.listen(4000, () => {
  console.log("It's alive");
  readData();
});
