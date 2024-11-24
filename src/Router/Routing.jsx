import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from "../Components/Login"
// import Chat from './components/Chat';
import Chat from "../Components/Chat"
import Register from '../Components/Register';

const Routing = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/register" element={<Register/>} />

      </Routes>
    </Router>
  );
};

export default Routing;
