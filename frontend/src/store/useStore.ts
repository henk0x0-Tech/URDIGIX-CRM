import { useAuthStore } from './authStore';
import { useUIStore } from './uiStore';
import { useNotificationStore } from './notificationStore';

export const useAppStore = <T>(selector: (state: any) => T): T => {
  const authState = useAuthStore();
  const uiState = useUIStore();
  const notificationState = useNotificationStore();

  const mergedState = {
    ...authState,
    ...uiState,
    ...notificationState,
  };

  return selector(mergedState);
};

export default useAppStore;
