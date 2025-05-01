import React, { useEffect, useState } from 'react';
import { Toggle, Box, SpaceBetween, Button } from '@cloudscape-design/components';

const EnvironmentSwitcher: React.FC = () => {
  const [isProduction, setIsProduction] = useState(
    localStorage.getItem('useProductionEnv') === 'true'
  );

  useEffect(() => {
    // Update localStorage when the toggle changes
    localStorage.setItem('useProductionEnv', isProduction ? 'true' : 'false');
  }, [isProduction]);

  const handleToggleChange = () => {
    setIsProduction(!isProduction);
  };

  const handleApplyChanges = () => {
    // Reload the page to apply the new configuration
    window.location.reload();
  };

  return (
    <Box padding="s">
      <SpaceBetween direction="vertical" size="s">
        <Toggle
          onChange={({ detail }) => setIsProduction(detail.checked)}
          checked={isProduction}
        >
          {isProduction ? 'Production Environment' : 'Sandbox Environment'}
        </Toggle>
        <Button onClick={handleApplyChanges} variant="primary">
          Apply Changes
        </Button>
      </SpaceBetween>
    </Box>
  );
};

export default EnvironmentSwitcher;