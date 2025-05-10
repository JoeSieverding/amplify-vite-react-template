import React from 'react';
import { ScaUpdateForm } from '../../../ui-components';

interface ScaUpdateFormWrapperProps {
  sca: any;
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
  
  const handleError = (error: any) => {
    showNotification("error", `Error updating SCA: ${error.message || "Unknown error"}`);
  };
  
  // Pass the props to the generated ScaUpdateForm component
  // We're using any type here because the generated component might not have TypeScript definitions
  const formProps: any = {
    sca,
    onSuccess: handleSuccess,
    onError: handleError,
    showNotification: showNotification
  };
  
  return <ScaUpdateForm {...formProps} />;
}

export default ScaUpdateFormWrapper;