import { useLocation } from 'react-router-dom';
import { ScaUpdateForm } from '../../../ui-components';

function ScaDetail() {
    const location = useLocation();
    const { item } = location.state || {};
 
    if (!item) {
      return <div>No item selected</div>;
    }

    return (
      <div>
        <div>
          <ScaUpdateForm sca={item} />
        </div>

      </div>
    );
  }

export default ScaDetail;
