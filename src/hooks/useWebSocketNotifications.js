import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMessages } from '../contexts/MessageContext';
import api from '../api';

const useWebSocketNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef(null);
  const previousNotifications = useRef([]);
  const hasFetched = useRef(false);
  const queryClient = useQueryClient();
  const { addMessage } = useMessages();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications/');
      if (hasFetched.current) {
        const newNotifications = data.filter(n => !previousNotifications.current.some(p => p.id === n.id));
        newNotifications.forEach(n => addMessage(n.message, 'info'));
      } else {
        hasFetched.current = true;
      }
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      previousNotifications.current = data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [addMessage]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    const apiUrl = new URL(import.meta.env.VITE_API_BASE_URL);
    const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${apiUrl.host}/ws/notifications/?token=${token}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'htmx_trigger' && data.event === 'notification-update') {
        fetchNotifications();
        queryClient.invalidateQueries();
      }
    };

    fetchNotifications();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchNotifications, queryClient]);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}/delete/`);
      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== id);
        setUnreadCount(updated.filter(n => !n.read).length);
        return updated;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.post('/notifications/clear-all/');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const clearReadNotifications = async () => {
    try {
      await api.post('/notifications/clear-read/');
      setNotifications(prev => {
        const updated = prev.filter(n => !n.read);
        setUnreadCount(updated.filter(n => !n.read).length);
        return updated;
      });
    } catch (error) {
      console.error('Error clearing read notifications:', error);
    }
  };

  return { notifications, unreadCount, markAsRead, deleteNotification, clearAllNotifications, clearReadNotifications };
};

export default useWebSocketNotifications;
