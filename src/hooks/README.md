# Custom Hooks

## useNotification

A custom hook for managing notification state in the application.

### Usage

```tsx
import useNotification from '../hooks/useNotification';
import NotificationAlert from '../components/common/NotificationAlert';

function MyComponent() {
  const { 
    showAlert, 
    alertType, 
    alertMessage, 
    showNotification, 
    hideNotification 
  } = useNotification();
  
  // Show a success notification
  const handleSuccess = () => {
    showNotification("success", "Operation completed successfully");
  };
  
  // Show an error notification
  const handleError = (error) => {
    showNotification("error", `Error: ${error.message}`);
  };
  
  return (
    <div>
      <NotificationAlert
        type={alertType}
        content={alertMessage}
        visible={showAlert}
        onDismiss={hideNotification}
      />
      
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={() => handleError(new Error("Something went wrong"))}>Show Error</button>
    </div>
  );
}
```

### Parameters

- `autoHideDuration` (optional): Duration in milliseconds before the notification auto-hides. Default is 5000ms (5 seconds).

### Return Value

- `showAlert`: Boolean indicating whether the alert is visible
- `alertType`: The type of alert ("success", "error", "warning", "info")
- `alertMessage`: The message to display in the alert
- `showNotification`: Function to show a notification
- `hideNotification`: Function to hide the notification

## Integration with Amplify UI Components

To integrate with Amplify UI generated components, create a wrapper component that passes the notification functions as props.

See `ScaUpdateFormWrapper.tsx` for an example implementation.