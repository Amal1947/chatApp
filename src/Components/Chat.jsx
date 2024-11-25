import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';

const SOCKET_URL = 'https://chatappbackend-1-nm92.onrender.com';

const Chat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = location.state || {};

    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        const loadMessageHistory = async () => {
            if (selectedUser && user) {
                try {
                    const response = await fetch(`${SOCKET_URL}/api/messages/${user.userId}/${selectedUser}`);
                    const history = await response.json();
                    if (Array.isArray(history)) {
                        setMessages(history);
                    }
                } catch (err) {
                    console.error('Failed to load message history:', err);
                    setError('Failed to load message history');
                }
            }
        };

        loadMessageHistory();
    }, [selectedUser, user]);

    // Socket connection setup
    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }

        const connectSocket = () => {
            try {
                const newSocket = io(SOCKET_URL, {
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    reconnectionAttempts: 5,
                });

                newSocket.on('connect', () => {
                    setIsConnecting(false);
                    setError(null);
                    newSocket.emit('register', user.userId);
                });

                newSocket.on('connect_error', (err) => {
                    setError('Failed to connect to chat server');
                    setIsConnecting(false);
                });

                newSocket.on('userList', (users) => {
                    setOnlineUsers(users.filter((id) => id !== user.userId));
                });

                newSocket.on('receiveMessage', (message) => {
                    setMessages((prev) => [...prev, {
                        ...message,
                        timestamp: new Date(message.timestamp),
                    }]);
                });

                setSocket(newSocket);

                return () => {
                    newSocket.close();
                };
            } catch (err) {
                setError('Failed to initialize chat');
                setIsConnecting(false);
            }
        };

        connectSocket();
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleTyping = () => {
        if (socket && selectedUser) {
            if (typingTimeoutRef.current) {

                clearTimeout(typingTimeoutRef.current);
            }

            socket.emit('typing', {
                senderId: user.userId,
                recipientId: selectedUser,
            });

            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('stopTyping', { recipientId: selectedUser });
            }, 2000);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (message.trim() && selectedUser && socket) {
            const tempMessage = {
                senderId: user.userId,
                recipientId: selectedUser,
                content: message.trim(),
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, tempMessage]);

            socket.emit('sendMessage', {
                senderId: user.userId,
                recipientId: selectedUser,
                content: message.trim(),
            });

            setMessage('');
        }
    };

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`absolute lg:relative transform lg:transform-none transition-transform duration-300 bg-white border-r border-gray-200 w-64 lg:w-1/4 p-4 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <h2 className="text-xl font-bold mb-4">Online Users</h2>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                {onlineUsers.length === 0 ? (
                    <div className="text-gray-500">No users online</div>
                ) : (
                    <div className="space-y-2">
                        {onlineUsers.map((userId) => (
                            <div
                                key={userId}
                                className={`p-2 cursor-pointer rounded ${
                                    selectedUser === userId
                                        ? 'bg-indigo-100'
                                        : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedUser(userId)}
                            >
                                User {userId}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-md"
                onClick={toggleSidebar}
            >
                {sidebarOpen ? 'Close' : 'Menu'}
            </button>
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedUser ? (
                        messages.length === 0 ? (
                            <div className="text-center">No messages yet. Start a conversation!</div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${
                                        msg.senderId === user.userId
                                            ? 'justify-end'
                                            : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`p-2 rounded-lg ${
                                            msg.senderId === user.userId
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-gray-200 text-gray-900'
                                        }`}
                                    >
                                        <div>{msg.content}</div>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        <div className="text-center text-gray-500">
                            Select a user to start chatting
                        </div>
                    )}
                    {isTyping && <div className="text-gray-500 text-sm">User is typing...</div>}
                    <div ref={messagesEndRef} />
                </div>

                <form
                    className="border-t border-gray-200 p-4 flex items-center space-x-2"
                    onSubmit={sendMessage}
                >
                    <input
                        type="text"
                        placeholder={
                            selectedUser ? 'Type a message' : 'Select a user to start chatting'
                        }
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            handleTyping();
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={!selectedUser}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!selectedUser || !message.trim()}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
