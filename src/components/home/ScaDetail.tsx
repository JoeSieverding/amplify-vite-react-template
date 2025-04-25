import { useLocation } from 'react-router-dom';
import { ScaUpdateForm } from '../../../ui-components';
//import type { Schema } from '../../../amplify/data/resource';

function ScaDetail() {
  const location = useLocation();
  const sca = location.state?.item || null;

  return (
    <div>
      <ScaUpdateForm sca={sca} />
    </div>
  );
}

export default ScaDetail;