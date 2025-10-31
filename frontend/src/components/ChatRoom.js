import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiSend, FiUsers } from 'react-icons/fi';
import { useChat } from '../contexts/ChatContext';

const ChatRoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatHeader = styled.div`
  background: #3BAFDA;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const RoomName = styled.h2`
  margin: 0;
  font-size: 1.25rem;
`;

const RoomDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
`;

const OnlineUsers = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
`;

const Message = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  background: ${props => props.isOwn ? '#3BAFDA' : 'white'};
  color: ${props => props.isOwn ? 'white' : '#333'};
  padding: 0.75rem 1rem;
  border-radius: 18px;
  max-width: 70%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
`;

const MessageInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  color: #666;
`;

const MessageTime = styled.span`
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.25rem;
`;

const TypingIndicator = styled.div`
  font-style: italic;
  color: #666;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
`;

const InputContainer = styled.div`
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e5e5;
  display: flex;
  gap: 0.5rem;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e5e5e5;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #3BAFDA;
  }
`;

const SendButton = styled.button`
  background: #3BAFDA;
  color: white;
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: #2A9BC7;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
`;

const ChatRoom = ({ room, user, wsRef }) => {
  const [message, setMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { messages, addMessage, sendMessage } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!room || !user) return;

    // Connect to WebSocket
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`ws://localhost:8000/ws/${room.id}?token=${token}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          addMessage(data);
          break;
        case 'user_joined':
          setOnlineUsers(prev => [...prev, { user_id: data.user_id, username: data.username }]);
          break;
        case 'user_left':
          setOnlineUsers(prev => prev.filter(u => u.user_id !== data.user_id));
          break;
        case 'room_users':
          setOnlineUsers(data.users);
          break;
        case 'typing':
          if (data.username !== user.username) {
            setTypingUsers(prev => {
              const filtered = prev.filter(u => u.username !== data.username);
              if (data.is_typing) {
                return [...filtered, { username: data.username }];
              }
              return filtered;
            });
          }
          break;
        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [room, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !wsRef.current) return;

    const messageData = {
      type: 'message',
      content: message.trim(),
      room_id: room.id
    };

    wsRef.current.send(JSON.stringify(messageData));
    setMessage('');
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!wsRef.current) return;

    // Send typing indicator
    const typingData = {
      type: 'typing',
      is_typing: true,
      room_id: room.id
    };
    
    wsRef.current.send(JSON.stringify(typingData));

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      const stopTypingData = {
        type: 'typing',
        is_typing: false,
        room_id: room.id
      };
      wsRef.current.send(JSON.stringify(stopTypingData));
    }, 1000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <ChatRoomContainer>
      <ChatHeader>
        <RoomInfo>
          <RoomName>{room.name}</RoomName>
          {room.description && (
            <RoomDescription>{room.description}</RoomDescription>
          )}
        </RoomInfo>
        <OnlineUsers>
          <FiUsers />
          {onlineUsers.length} online
        </OnlineUsers>
      </ChatHeader>

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <h3>No messages yet</h3>
            <p>Start the conversation by sending a message!</p>
          </EmptyState>
        ) : (
          messages.map((msg) => (
            <Message key={msg.id} isOwn={msg.user_id === user.id}>
              <MessageInfo>
                <span>{msg.user.username}</span>
              </MessageInfo>
              <MessageBubble isOwn={msg.user_id === user.id}>
                {msg.content}
              </MessageBubble>
              <MessageTime>{formatTime(msg.created_at)}</MessageTime>
            </Message>
          ))
        )}
        
        {typingUsers.length > 0 && (
          <TypingIndicator>
            {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </TypingIndicator>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          <MessageInput
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            maxLength={1000}
          />
          <SendButton type="submit" disabled={!message.trim()}>
            <FiSend />
          </SendButton>
        </form>
      </InputContainer>
    </ChatRoomContainer>
  );
};

export default ChatRoom;
