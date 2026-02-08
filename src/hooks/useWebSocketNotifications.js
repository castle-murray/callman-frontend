import { useEffect, useRef, useState } from 'react';
import { useMessages } from '../contexts/MessageContext';

const useWebSocketNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef(null);
  const previousNotifications = useRef([]);
  const hasFetched = useRef(false);
  const { addMessage } = useMessages();

  useEffect(() => {
    // Connect to WebSocket
    const token = localStorage.getItem('authToken');

    const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`;
    wsRef.current = new WebSocket(wsUrl);


    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'htmx_trigger' && data.event === 'notification-update') {
        // Fetch updated notifications
        fetchNotifications();
      }
    };

    // Fetch initial notifications
    fetchNotifications();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (hasFetched.current) {
          const newNotifications = data.filter(n => !previousNotifications.current.some(p => p.id === n.id));
          newNotifications.forEach(n => addMessage(n.message, 'info'));
        } else {
          hasFetched.current = true;
        }
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
        previousNotifications.current = data;
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${id}/read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${id}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setNotifications(prev => {
          const updated = prev.filter(n => n.id !== id);
          setUnreadCount(updated.filter(n => !n.read).length);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/clear-all/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const clearReadNotifications = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/clear-read/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setNotifications(prev => {
          const updated = prev.filter(n => !n.read);
          setUnreadCount(updated.filter(n => !n.read).length);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error clearing read notifications:', error);
    }
  };

  return { notifications, unreadCount, markAsRead, deleteNotification, clearAllNotifications, clearReadNotifications };
};

export default useWebSocketNotifications;
