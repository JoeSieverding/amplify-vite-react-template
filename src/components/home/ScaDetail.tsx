import { useLocation } from 'react-router-dom';
import {
  Container,
  SpaceBetween
} from "@cloudscape-design/components";
import ScaUpdateFormWrapper from './ScaUpdateFormWrapper';
import NotificationAlert from '../Common/NotificationAlert';
import useNotification from '../../hooks/useNotification';
//import type { Schema } from '../../../amplify/data/resource';

function ScaDetail() {
  const location = useLocation();
  const sca = location.state?.item || null;
  const { 
    showAlert, 
    alertType, 
    alertMessage, 
    showNotification, 
    hideNotification 
  } = useNotification();
  
  return (
    <Container>
      <SpaceBetween size="l">
        <NotificationAlert
          type={alertType}
          content={alertMessage}
          visible={showAlert}
          onDismiss={hideNotification}
        />
        
        <ScaUpdateFormWrapper 
          sca={sca} 
          showNotification={showNotification}
        />
      </SpaceBetween>
    </Container>
  );
}

export default ScaDetail;