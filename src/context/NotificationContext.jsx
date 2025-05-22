import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Añadir una nueva notificación
  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(), // ID único simple
      message,
      read: false,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // Marcar una notificación como leída
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id && !notif.read ? { ...notif, read: true } : notif
      )
    );
    // Solo decrementa si la notificación estaba realmente no leída
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1)); 
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
