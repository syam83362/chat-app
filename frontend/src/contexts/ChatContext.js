import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/rooms/');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (name, description, isPrivate = false) => {
    try {
      const response = await axios.post('/rooms/', {
        name,
        description,
        is_private: isPrivate
      });
      
      setRooms(prev => [...prev, response.data]);
      return { success: true, room: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to create room' 
      };
    }
  };

  const joinRoom = async (roomId) => {
    try {
      await axios.post(`/rooms/${roomId}/join`);
      await fetchRooms(); // Refresh rooms list
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to join room' 
      };
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await axios.get(`/messages/room/${roomId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content, roomId) => {
    try {
      const response = await axios.post('/messages/', {
        content,
        room_id: roomId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  const selectRoom = (room) => {
    setCurrentRoom(room);
    if (room) {
      fetchMessages(room.id);
    }
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const updateRoomUsers = (roomId, users) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, users } : room
    ));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const value = {
    rooms,
    currentRoom,
    messages,
    loading,
    fetchRooms,
    createRoom,
    joinRoom,
    fetchMessages,
    sendMessage,
    selectRoom,
    addMessage,
    updateRoomUsers
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
