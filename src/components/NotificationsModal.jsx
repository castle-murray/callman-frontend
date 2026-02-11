import React from 'react';
import { Link } from 'react-router-dom';

const NotificationsModal = ({ notifications, unreadCount, onClose, markAsRead, deleteNotification, clearAllNotifications, clearReadNotifications }) => {
  const getResponseColor = (response) => {
    switch (response) {
      case 'Declined':
      case 'Canceled':
        return 'text-red-500 dark:text-red-400';
      case 'Confirmed':
        return 'text-green-500 dark:text-green-400';
      case 'Available':
        return 'text-teal-500 dark:text-teal-400';
      default:
        return 'text-gray-600 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 mt-2 border-secondary border-solid border-2 bg-white dark:bg-dark-card-bg rounded-lg shadow-md p-4 w-full lg:w-auto lg:mx-auto max-h-1/2 z-40 max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-stretch flex-grow h-full">
          <div className="flex flex-col flex-grow min-h-0">
            {notifications.length === 0 ? (
              <p className="px-4 py-2">No notifications.</p>
            ) : (
              <div>
                <ul className="divide-y divide-gray-100 dark:divide-dark-border-dark overflow-y-auto flex-grow custom-scrollbar max-h-96">
                {notifications.map(notification => (
                  <li key={notification.id} className={`px-2 lg:px-4 py-2 ${notification.read ? 'bg-gray-100 dark:bg-dark-border-dark' : 'bg-white dark:bg-dark-card-bg'} hover:bg-gray-100 dark:hover:bg-dark-border-dark`}>
                    {notification.labor_requirement_slug ? (
                      <div className="flex flex-grow-0">
                        <div className="flex flex-col w-1/6 mr-1">
                          {notification.response && (
                            <p className={`text-sm ${getResponseColor(notification.response)}`}>{notification.response}</p>
                          )}
                          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                            {new Date(notification.sent_at).toLocaleDateString()} {new Date(notification.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <div className="flex flex-col flex-grow">
                          <Link to={`/dash/request/${notification.labor_requirement_slug}/fill-list`} className="block" onClick={() => { markAsRead(notification.id); onClose(); }}>
                            <span className="text-text-primary dark:text-dark-text-primary">{notification.message}</span>
                          </Link>
                        </div>
                        <div className="flex flex-col ml-2">
                          <button type="button" className="bg-primary text-dark-text-primary px-2 py-1 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}>
                            Clear
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-grow-0">
                        <div className="flex flex-col w-1/6 mr-1">
                          {notification.response && (
                            <p className={`text-sm ${getResponseColor(notification.response)}`}>{notification.response}</p>
                          )}
                          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                            {new Date(notification.sent_at).toLocaleDateString()} {new Date(notification.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <div className="flex flex-col w-full">
                          <span className="text-text-primary dark:text-dark-text-primary">{notification.message}</span>
                        </div>
                        <div className="flex flex-col ml-2">
                          <button type="button" className="bg-primary text-dark-text-primary px-2 py-1 rounded hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}>
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="flex justify-around mt-3">
                <button className="w-auto bg-primary text-dark-text-primary px-5 py-1 rounded-lg hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover" onClick={clearReadNotifications}>
                  Clear Read
                </button>
                <button className="w-auto bg-primary text-dark-text-primary px-5 py-1 rounded-lg hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover" onClick={clearAllNotifications}>
                  Clear All
                </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
