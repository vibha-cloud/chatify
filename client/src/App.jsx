import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Chats from "./pages/Chats";

const App = () => {
  return (
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
  );
};

export default App;
