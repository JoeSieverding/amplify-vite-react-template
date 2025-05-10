import { ScaUpdateForm } from '../../../ui-components';
import type { Schema } from "../../../amplify/data/resource";

// Define the type for the SCA object
type ScaType = Schema['Sca']['type'];

// Define a type for errors
interface ErrorWithMessage {
  message?: string;
  [key: string]: unknown;
}

interface ScaUpdateFormWrapperProps {
  sca: ScaType;
  showNotification: (type: "success" | "error" | "warning" | "info", message: string) => void;
}

/**
 * Wrapper component for the generated ScaUpdateForm
 * This allows us to add notification functionality without modifying the generated component
 */
function ScaUpdateFormWrapper({ sca, showNotification }: ScaUpdateFormWrapperProps) {
  const handleSuccess = () => {
    showNotification("success", "SCA updated successfully");
  };
  
  const handleError = (error: ErrorWithMessage) => {
    showNotification("error", `Error updating SCA: ${error.message || "Unknown error"}`);
  };
  
  // Pass the props to the generated ScaUpdateForm component
  // The generated component has its own type definitions that don't match our Schema types,
  // but we're ensuring type safety for the parts we control
  
  // Use type assertion to pass the showNotification prop
  // This is necessary because the TypeScript definitions don't include this prop,
  // but we know the component actually uses it
  // Create a props object with all the properties we want to pass
  const props = {
    sca,
    onSuccess: handleSuccess,
    onError: handleError,
    showNotification
  };

  return <ScaUpdateForm {...props} />;
}

export default ScaUpdateFormWrapper;