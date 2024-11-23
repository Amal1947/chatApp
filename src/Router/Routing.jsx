import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Login from './components/Login';
// import Chat from './components/Chat';
import Chat from "../Components/Chat"

const Routing = () => {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
};

export default Routing;
