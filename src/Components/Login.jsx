import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState("")
    const [user, setUser] = useState({})
    const [error, setError] = useState('');
    const navigate = useNavigate();

   // Frontend - Login.js - Update Response Handling

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log("if");
    
      const response = await axios.post('https://chatappbackend-1-nm92.onrender.com/api/login', {
          username,
          password
      });

      // Get the user details directly from the response
      const { userId, username: user } = response.data;

      // Save user info locally (No token involved)
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', user);

       setUser({ userId, username: user });
       setIsAuthenticated(true)
       navigate('/chat', {
        state: {
            isAuthenticated: true,
            user: { userId, username: user },
        },
    });
    } 
    catch (error) {
console.log(error);

  }
};


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="text-red-500 text-center">{error}</div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign in
                        </button>
                    </div>
                    <div>
                      <button onClick={()=>{navigate("/register")}}>register</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;