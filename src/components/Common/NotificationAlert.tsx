import React from 'react';
import { Alert } from '@cloudscape-design/components';

interface NotificationAlertProps {
  type: "success" | "error" | "warning" | "info";
  content: string;
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Reusable notification alert component
 */
const NotificationAlert: React.FC<NotificationAlertProps> = ({
  type,
  content,
  visible,
  onDismiss
}) => {
  if (!visible) return null;
  
  return (
    <Alert
      type={type}
      dismissible
      onDismiss={onDismiss}
    >
      {content}
    </Alert>
  );
};

export default NotificationAlert;