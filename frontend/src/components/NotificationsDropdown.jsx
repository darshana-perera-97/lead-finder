import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function NotificationsDropdown({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/api/notifications/unread', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4001/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4001/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => {
          const filtered = prev.filter(n => n.id !== notificationId);
          const deleted = prev.find(n => n.id === notificationId);
          if (deleted && !deleted.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
          return filtered;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      <div 
        ref={dropdownRef}
        className="fixed md:absolute right-0 top-0 md:top-full mt-0 md:mt-2 w-full md:w-96 max-w-md md:max-w-none mx-auto md:mx-0 bg-white rounded-none md:rounded-lg shadow-xl border-0 md:border border-gray-200 z-50 h-screen md:h-auto md:max-h-[600px] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-[#2D3748]">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs sm:text-sm text-[#008080] hover:underline px-2 py-1 sm:px-0 sm:py-0"
              >
                <span className="hidden sm:inline">Mark all as read</span>
                <span className="sm:hidden">Mark all</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4 text-[#718096]" />
            </button>
          </div>
        </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-8 h-8 border-4 border-[#008080] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs sm:text-sm text-[#718096]">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-[#718096]/30 mx-auto mb-3" />
            <p className="text-xs sm:text-sm text-[#718096]">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-medium ${!notification.read ? 'text-[#2D3748]' : 'text-[#718096]'} break-words`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-[#718096] mt-1 break-words">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[#718096] mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-[#008080] hover:underline flex items-center gap-1 px-2 py-1.5 sm:px-0 sm:py-0 rounded hover:bg-blue-50 sm:hover:bg-transparent transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                          <span className="hidden sm:inline">Mark as read</span>
                          <span className="sm:hidden">Read</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:underline flex items-center gap-1 px-2 py-1.5 sm:px-0 sm:py-0 rounded hover:bg-red-50 sm:hover:bg-transparent transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
}

