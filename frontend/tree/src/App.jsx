import { useState } from "react";
import "./App.css";
import axios from "axios";
import TreeView from "../components/TreeView/TreeView";

function App() {
  return (
    <>
      <h1>Tree View</h1>
      <div className="big-container">
        <TreeView></TreeView>
      </div>
    </>
  );
}

export default App;
