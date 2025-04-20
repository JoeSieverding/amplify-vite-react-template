import { useNavigate } from 'react-router-dom';
import { ScaCreateForm } from '../../../ui-components';

function AddSca() {
    const navigation = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <ScaCreateForm {...{ navigation } as any}/>;
}

export default AddSca;

