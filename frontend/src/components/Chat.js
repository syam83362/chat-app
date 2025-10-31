import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import Sidebar from './Sidebar';
import ChatRoom from './ChatRoom';
import CreateRoomModal from './CreateRoomModal';

const ChatContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f5f5f5;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: #0F3557;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Username = styled.span`
  font-weight: 500;
`;

const LogoutButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: #c0392b;
  }
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  background: white;
`;

const WelcomeMessage = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
  font-size: 1.2rem;
`;

const Chat = () => {
  const { user, logout } = useAuth();
  const { currentRoom, rooms, loading } = useChat();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    // WebSocket connection will be established when a room is selected
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleLogout = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    logout();
  };

  return (
    <ChatContainer>
      <Sidebar 
        rooms={rooms} 
        loading={loading}
        onCreateRoom={() => setShowCreateModal(true)}
      />
      
      <MainContent>
        <Header>
          <Title>Real-Time Chat</Title>
          <UserInfo>
            <Username>Welcome, {user?.username}</Username>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </UserInfo>
        </Header>
        
        <ChatArea>
          {currentRoom ? (
            <ChatRoom 
              room={currentRoom} 
              user={user}
              wsRef={wsRef}
            />
          ) : (
            <WelcomeMessage>
              <h2>Welcome to Real-Time Chat!</h2>
              <p>Select a room from the sidebar to start chatting</p>
            </WelcomeMessage>
          )}
        </ChatArea>
      </MainContent>

      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}
    </ChatContainer>
  );
};

export default Chat;
