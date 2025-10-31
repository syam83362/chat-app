import React from 'react';
import styled from 'styled-components';
import { FiPlus, FiMessageSquare, FiUsers } from 'react-icons/fi';
import { useChat } from '../contexts/ChatContext';

const SidebarContainer = styled.div`
  width: 300px;
  background: white;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e5e5e5;
  background: #f8f9fa;
`;

const CreateButton = styled.button`
  width: 100%;
  background: #C6D300;
  color: #0F3557;
  border: none;
  padding: 0.75rem;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.3s;

  &:hover {
    background: #B8C500;
  }
`;

const RoomsList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const RoomItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
  background: ${props => props.active ? '#EAF8F9' : 'white'};
  border-left: ${props => props.active ? '4px solid #3BAFDA' : '4px solid transparent'};

  &:hover {
    background: #f8f9fa;
  }
`;

const RoomName = styled.div`
  font-weight: 500;
  color: #0F3557;
  margin-bottom: 0.25rem;
`;

const RoomDescription = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const RoomMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #999;
`;

const LoadingMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #666;
`;

const EmptyMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #666;
`;

const Sidebar = ({ rooms, loading, onCreateRoom }) => {
  const { selectRoom, currentRoom } = useChat();

  return (
    <SidebarContainer>
      <SidebarHeader>
        <CreateButton onClick={onCreateRoom}>
          <FiPlus />
          Create Room
        </CreateButton>
      </SidebarHeader>
      
      <RoomsList>
        {loading ? (
          <LoadingMessage>Loading rooms...</LoadingMessage>
        ) : rooms.length === 0 ? (
          <EmptyMessage>
            <FiMessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <div>No rooms yet</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Create your first room to get started
            </div>
          </EmptyMessage>
        ) : (
          rooms.map(room => (
            <RoomItem
              key={room.id}
              active={currentRoom?.id === room.id}
              onClick={() => selectRoom(room)}
            >
              <RoomName>{room.name}</RoomName>
              {room.description && (
                <RoomDescription>{room.description}</RoomDescription>
              )}
              <RoomMeta>
                <span>
                  <FiUsers style={{ marginRight: '0.25rem' }} />
                  {room.is_private ? 'Private' : 'Public'}
                </span>
              </RoomMeta>
            </RoomItem>
          ))
        )}
      </RoomsList>
    </SidebarContainer>
  );
};

export default Sidebar;
