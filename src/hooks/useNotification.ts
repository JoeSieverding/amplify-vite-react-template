import { useState } from 'react';

type NotificationType = "success" | "error" | "warning" | "info";

interface UseNotificationResult {
  showAlert: boolean;
  alertType: NotificationType;
  alertMessage: string;
  showNotification: (type: NotificationType, message: string) => void;
  hideNotification: () => void;
}

/**
 * Custom hook for managing notification state
 * @param autoHideDuration Duration in milliseconds before the notification auto-hides (default: 5000ms)
 * @returns Object containing notification state and functions
 */
export function useNotification(autoHideDuration = 5000): UseNotificationResult {
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<NotificationType>("success");
  const [alertMessage, setAlertMessage] = useState("");
  
  const showNotification = (type: NotificationType, message: string) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    
    // Automatically hide the alert after the specified duration
    if (autoHideDuration > 0) {
      setTimeout(() => {
        setShowAlert(false);
      }, autoHideDuration);
    }
  };
  
  const hideNotification = () => {
    setShowAlert(false);
  };
  
  return {
    showAlert,
    alertType,
    alertMessage,
    showNotification,
    hideNotification
  };
}

export default useNotification;