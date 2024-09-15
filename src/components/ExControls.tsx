import { Controls } from '@xyflow/react';
import ExportJsonButton from './controls-button/ExportJsonButton';
import { useAdmin } from '../contexts/PermissionContext';
import ImportCsvButton from './controls-button/ImportCsvButton';

function ExControls() {
	const { isAdmin } = useAdmin();

	return (
		<Controls showInteractive={false}>
			{isAdmin && (
				<>
					<ExportJsonButton />
					<ImportCsvButton />
				</>
			)}
		</Controls>
	);
}

export default ExControls;
