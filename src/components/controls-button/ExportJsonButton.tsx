import Icon from '@mui/material/Icon';
import Tooltip from '@mui/material/Tooltip';
import { ControlButton, useReactFlow } from '@xyflow/react';

function ExportJsonButton() {
	const { getNodes, getEdges } = useReactFlow();

	const handleExport = () => {
		const nodes = getNodes();
		const edges = getEdges();

		const nodesJson = JSON.stringify(nodes, null, 2);
		downloadJson(nodesJson, 'InitialNodes.json');

		const edgesJson = JSON.stringify(edges, null, 2);
		downloadJson(edgesJson, 'InitialEdges.json');
	};

	const downloadJson = (jsonString: string, fileName: string) => {
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		link.click();
		URL.revokeObjectURL(url);
	};

	return (
		<ControlButton onClick={handleExport}>
			<Tooltip title="Export Json" placement="right">
				<Icon>file_download</Icon>
			</Tooltip>
		</ControlButton>
	);
}

export default ExportJsonButton;
