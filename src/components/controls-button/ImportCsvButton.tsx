import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '@mui/material/Icon';
import Tooltip from '@mui/material/Tooltip';
import { ConnectionLineType, ControlButton, MarkerType, useReactFlow } from '@xyflow/react';
import Papa from 'papaparse';
import { Node, Edge } from '@xyflow/react';

interface CSVRow {
	id: string;
	label: string;
	bgColor: string;
	[key: string]: string;
}

const HANDLE_PAIRS: Record<string, [string, string]> = {
	lr: ['right', 'left'],
	rl: ['left', 'right'],
	bt: ['bottom', 'top'],
	tb: ['top', 'bottom'],
	br: ['bottom', 'right'],
	bl: ['bottom', 'left'],
	tr: ['top', 'right'],
	tl: ['top', 'left'],
	rb: ['right', 'bottom'],
	rt: ['right', 'top'],
	lb: ['left', 'bottom'],
	lt: ['left', 'top']
};

function ImportCsvButton() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { setNodes, setEdges, getNodes } = useReactFlow();
	const [isInitd, setIsInitd] = useState(false);
	const [nodeConnections, setNodeConnections] = useState<Record<string, string[]>>({});
	const [savedNodePositions, setSavedNodePositions] = useState<Record<string, { x: number; y: number }>>(() => {
		const positions: Record<string, { x: number; y: number }> = {};
		getNodes().forEach(node => {
			positions[node.id] = { x: node.position.x, y: node.position.y };
		});
		return positions;
	});

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsInitd(false);

		const currentNodes = getNodes();
		const currentPositions: Record<string, { x: number; y: number }> = {};
		currentNodes.forEach(node => {
			currentPositions[node.id] = node.position;
		});
		setSavedNodePositions(currentPositions);

		const file = event.target.files?.[0];
		if (!file) return;

		Papa.parse(file, {
			complete: (results: Papa.ParseResult<CSVRow>) => {
				const tempNodes: Node[] = [];
				const connections: Record<string, string[]> = {};
				generateNodesAndConnections(results.data, tempNodes, connections);
				setNodes(tempNodes);
				setNodeConnections(connections);
				setConnectEdges(results.data);
				setTimeout(() => setIsInitd(true), 100);
			},
			header: true
		});
	};

	useEffect(() => {
		if (isInitd) {
			sortNodes();
			setNodeConnections({});
		}
	}, [isInitd]);

	const generateNodesAndConnections = (rows: CSVRow[], nodeBox: Node[], connections: Record<string, string[]>) => {
		rows.forEach(row => {
			nodeBox.push({
				id: row.id,
				position: { x: 0, y: 0 },
				data: { label: row.label, bgColor: row.bgColor, isLocked: row.isLocked },
				type: 'FlipRectangleNode'
			});

			Object.entries(row).forEach(([key, value]) => {
				if (key.startsWith('target_') && !key.endsWith('_path') && value) {
					const pathKey = `${key}_path`;
					const path = row[pathKey] as string;
					if (path === 'bt') {
						if (!connections[row.id]) {
							connections[row.id] = [];
						}
						connections[row.id].push(value);
					}
				}
			});
		});
	};

	const sortNodes = useCallback(() => {
		const nodeElements = document.querySelectorAll('.react-flow__node');
		const nodeWidths: Record<string, number> = {};
		nodeElements.forEach(el => {
			const nodeId = el.getAttribute('data-id');
			if (nodeId) {
				nodeWidths[nodeId] = el.clientWidth;
			}
		});
		const nodePositions: Record<string, { x: number; y: number }> = {};

		const rootNodes = Object.keys(nodeConnections).filter(nodeId => {
			return !Object.values(nodeConnections).some(children => children.includes(nodeId));
		});

		let currentX = 0;
		rootNodes.forEach(rootNodeId => {
			// 確保新樹的根節點不會與現有節點重疊，考慮節點寬度
			while (
				Object.values(nodePositions).some(pos => {
					const existingNodeId = Object.keys(nodePositions).find(id => nodePositions[id].x === pos.x);
					const existingNodeWidth = existingNodeId ? nodeWidths[existingNodeId] : 0;
					return Math.abs(pos.x - currentX) < (existingNodeWidth + (nodeWidths[rootNodeId] || 0)) / 2 + 50;
				})
			) {
				currentX += 100;
			}
			calculatePositions(nodePositions, nodeConnections, nodeWidths, rootNodeId, currentX, 0);
			currentX += (nodeWidths[rootNodeId] || 0) + 100; // 增加間距以避免重疊
		});

		if (Object.keys(savedNodePositions).length > 0) {
			Object.keys(nodePositions).forEach(nodeId => {
				const node = getNodes().find(n => n.id === nodeId);
				if (node && savedNodePositions[nodeId] && node.data.isLocked === '1') {
					nodePositions[nodeId] = savedNodePositions[nodeId];
				}
			});
		}

		const nodes = getNodes().map(node => ({
			...node,
			position: nodePositions[node.id] || node.position
		}));

		setNodes(nodes);
	}, [nodeConnections, getNodes]);

	const setConnectEdges = (rows: CSVRow[]) => {
		const edges: Edge[] = [];
		rows.forEach(row => {
			Object.entries(row).forEach(([key, value]) => {
				if (key.startsWith('target_') && !key.endsWith('_path') && value) {
					const pathKey = `${key}_path`;
					const path = row[pathKey] as string;
					const [sourceHandle, targetHandle] = HANDLE_PAIRS[path] || HANDLE_PAIRS['bt'];

					edges.push({
						id: `${row.id}-${value}`,
						source: row.id,
						target: value,
						sourceHandle,
						targetHandle,
						type: 'Edge',
						markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15 }
					});
				}
			});
		});
		setEdges(edges);
	};

	const calculatePositions = (
		nodePositions: Record<string, { x: number; y: number }>,
		nodeConnections: Record<string, string[]>,
		nodeWidths: Record<string, number>,
		nodeId: string,
		x: number = 0,
		y: number = 0
	) => {
		if (nodePositions[nodeId]) return;

		nodePositions[nodeId] = { x, y };
		const children = nodeConnections[nodeId] || [];
		let childX = x;

		children.forEach(childId => {
			calculatePositions(nodePositions, nodeConnections, nodeWidths, childId, childX, y + 150);
			childX += (nodeWidths[childId] || 0) + 50;
		});

		if (children.length > 0) {
			const leftmostChild = nodePositions[children[0]];
			const rightmostChild = nodePositions[children[children.length - 1]];
			nodePositions[nodeId].x = (leftmostChild.x + rightmostChild.x) / 2;
		}

		nodePositions[nodeId].y = y;

		Object.keys(nodePositions).forEach(existingNodeId => {
			if (existingNodeId !== nodeId && nodePositions[existingNodeId].y === y) {
				const existingNodeX = nodePositions[existingNodeId].x;
				const existingNodeWidth = nodeWidths[existingNodeId] || 0;
				const currentNodeWidth = nodeWidths[nodeId] || 0;
				if (Math.abs(existingNodeX - nodePositions[nodeId].x) < (existingNodeWidth + currentNodeWidth) / 2) {
					nodePositions[nodeId].x = existingNodeX + (existingNodeWidth + currentNodeWidth) / 2 + 50;
				}
			}
		});

		if (children.length === 1) {
			const childId = children[0];
			const childWidth = nodeWidths[childId] || 0;
			const childPosition = nodePositions[childId];
			nodePositions[nodeId].x = childPosition.x + (childWidth - (nodeWidths[nodeId] || 0)) / 2;
		}
	};

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<>
			<input
				type="file"
				ref={fileInputRef}
				style={{ display: 'none' }}
				accept=".csv"
				onChange={handleFileUpload}
			/>
			<ControlButton onClick={handleButtonClick}>
				<Tooltip title="Import CSV" placement="right">
					<Icon>file_upload</Icon>
				</Tooltip>
			</ControlButton>
		</>
	);
}

export default ImportCsvButton;
