import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ModalType = 
  | 'createPrompt' 
  | 'createWorkflow' 
  | 'inviteUser' 
  | 'confirmDelete'
  | 'viewReport'
  | 'editWorkflow'
  | 'userSettings';

export interface Modal {
  type: ModalType;
  data?: any;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
}

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  isMobileSidebarOpen: boolean;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Modals
  activeModal: Modal | null;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Breadcrumbs
  breadcrumbs: Array<{ label: string; path?: string }>;
  
  // Actions
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isSidebarOpen: true,
      isMobileSidebarOpen: false,
      theme: 'system',
      activeModal: null,
      notifications: [],
      unreadCount: 0,
      globalLoading: false,
      loadingMessage: null,
      breadcrumbs: [],

      // Actions
      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      toggleMobileSidebar: () => {
        set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen }));
      },

      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document
        const root = document.documentElement;
        if (theme === 'dark' || 
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },

      openModal: (type, data) => {
        set({ activeModal: { type, data } });
      },

      closeModal: () => {
        set({ activeModal: null });
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));

        // Auto-dismiss success notifications after 5 seconds
        if (notification.type === 'success') {
          setTimeout(() => {
            get().clearNotification(newNotification.id);
          }, 5000);
        }
      },

      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllNotificationsAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      clearNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          const wasUnread = notification && !notification.read;
          
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });
      },

      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      setGlobalLoading: (loading, message) => {
        set({ globalLoading: loading, loadingMessage: message || null });
      },

      setBreadcrumbs: (breadcrumbs) => {
        set({ breadcrumbs });
      },
    }),
    {
      name: 'ui-store',
    }
  )
);

// Helper hooks
export const useIsSidebarOpen = () => useUIStore((state) => state.isSidebarOpen);
export const useIsMobileSidebarOpen = () => useUIStore((state) => state.isMobileSidebarOpen);
export const useTheme = () => useUIStore((state) => state.theme);
export const useActiveModal = () => useUIStore((state) => state.activeModal);
export const useNotifications = () => useUIStore((state) => state.notifications);
export const useUnreadNotificationCount = () => useUIStore((state) => state.unreadCount);
export const useGlobalLoading = () => useUIStore((state) => ({
  isLoading: state.globalLoading,
  message: state.loadingMessage,
}));
export const useBreadcrumbs = () => useUIStore((state) => state.breadcrumbs);

// Selector for unread notifications
export const useUnreadNotifications = () =>
  useUIStore((state) => state.notifications.filter(n => !n.read));

// Selector for notifications by type
export const useNotificationsByType = (type: Notification['type']) =>
  useUIStore((state) => state.notifications.filter(n => n.type === type));