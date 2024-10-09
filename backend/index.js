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
  writeData(nodes);
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
    res.status(200).json("Success");
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
  const checkingForValidAction = (parentId, targetId) => {
    if (parentId === targetId) return true;
    const parent = nodes.find((node) => node.id === parentId);
    if (!parent || parent.parent_node_id == null) return false;
    return checkingForValidAction(parent.parent_node_id, targetId);
  };
  if (checkingForValidAction(newParentId, id)) {
    return res.status(400).json({ message: "Invalid action" });
  } else {
    nodes[indexOfNode].parent_node_id = newParentId;
    writeData(nodes);
    res.status(200).json("Success");
  }
});
// SQL PSEUDO KOD
/*
Inicijaliziramo MySql connection pool sa detaljima baze

Endpoint za dohvacanje cijelog stabla
1. GET request at "/nodes"
    QUERY = "SELECT * FROM nodes"
    return rows (status(200))
    if (error){
      return status(400)
    } 
2. Endpoint za dodavanje novog node-a u stablo
POST request at "/nodes/newNode/:parentId/:value"
  Izvucemo parametre iz requesta
  QUERY = "INSERT INTO nodes (title, parent_node_id, ordering) VALUES (?, ?, ?)", [value, parentId, 1]"
  return status(200)
  if (error){
    return status(400)
  } 

3.Endpoint za izmjenu podataka u node-u
PUT request at "/nodes/edit/:id/:newValue"
  Izvucemo parametre iz requesta
  QUERY = "UPDATE nodes SET title = ? WHERE id = ?", [newValue, id]
  return status(200)
  if (error){
    return status(400)
  } 

4. Endpoint za brisanje node-a i chidrena
 funkcija rekurzivniDelete(nodeId){
    QUERY children = "SELECT id FROM nodes WHERE parent_node_id = ?", [nodeId]
     for (child of children) {
        rekurzivniDelete(child.id);
      }
    QUERY = "DELETE FROM nodes WHERE id = ?", [nodeId];
 }
DELETE request at "/nodes/delete/:id"
  Izvucemo parametre iz requesta
    rekurzivniDelete(id)
    return status(200)
    if (error){
      return status(400)
    }    
5. Endpoint za pomicanje node-a pod novog parenta
PUT request at "/nodes/transferNode/:id/:newParentId"
  Izvucemo parametre iz requesta
  QUERY rows = "SELECT parent_node_id FROM nodes WHERE id = ?", [newParentId])
  parent = rows[0].parent_node.id
  while (parent) {
      if (parent == parseInt(id)) {
        return status(400)
      }
      QUERY newParentRow = ("SELECT parent_node_id FROM nodes WHERE id = ?", [parent]);
      parent = newParentRow[0].parent_node_id;
    }
  query = ("UPDATE nodes SET parent_node_id = ? WHERE id = ?", [newParentId, id]);
  return status(200)
  if (error){
    return status(400)
  }
*/

app.listen(4000, () => {
  console.log("It's alive");
  readData();
});
