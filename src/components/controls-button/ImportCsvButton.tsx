import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '@mui/material/Icon';
import Tooltip from '@mui/material/Tooltip';
import { ControlButton, MarkerType, useReactFlow } from '@xyflow/react';
import Papa from 'papaparse';
import { Node, Edge } from '@xyflow/react';

interface CSVRow {
	id: string;
	label: string;
	[key: string]: string;
}

function ImportCsvButton() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();
	const [isInitd, setIsInitd] = useState(false);
	const [nodeConnections, setNodeConnections] = useState<Record<string, string[]>>({});
	const [savedNodePositions, setSavedNodePositions] = useState<Record<string, { x: number; y: number }>>(() => {
		const positions: Record<string, { x: number; y: number }> = {};
		getNodes().forEach(node => {
			positions[node.id] = { x: node.position.x, y: node.position.y };
		});
		return positions;
	});
	const [savedEdges, setSavedEdges] = useState<Edge[]>([]);

	const bgColorRules: Record<string, string> = {
		A: '#769FCD',
		B: '#CD7690',
		C: '#76cd87',
		D: '#8f76cd',
		E: '#bdcd76',
		F: '#cdb476',
		G: '#9476cd',
		W: '#cd76cc'
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsInitd(false);

		const currentNodes = getNodes();
		const currentPositions: Record<string, { x: number; y: number }> = {};
		currentNodes.forEach(node => {
			currentPositions[node.id] = node.position;
		});
		setSavedNodePositions(currentPositions);

		const currentEdges = getEdges();
		setSavedEdges(currentEdges);

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
			if (row.isDisabled === '1') return; // 如果 isDisabled 為 '1'，則跳過該節點

			let bgColor = row.bgColor;
			for (const [key, color] of Object.entries(bgColorRules)) {
				if (row.id.includes(key)) {
					bgColor = color;
					break;
				}
			}

			nodeBox.push({
				id: row.id,
				position: { x: 0, y: 0 },
				data: { label: row.label, bgColor, isLocked: row.isLocked },
				type: 'FlipRectangleNode'
			});

			Object.entries(row).forEach(([key, value]) => {
				if (key.startsWith('source_') && value) {
					if (!connections[value]) {
						connections[value] = [];
					}
					connections[value].push(row.id);
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
					return Math.abs(pos.x - currentX) < (existingNodeWidth + (nodeWidths[rootNodeId] || 0)) / 2 + 100;
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
				if (key.startsWith('source_') && value) {
					const existingEdge = savedEdges.find(edge => edge.source === value && edge.target === row.id);
					if (existingEdge && row.isLocked === '1') {
						edges.push(existingEdge);
					} else {
						edges.push({
							id: `${value}-${row.id}`,
							source: value,
							target: row.id,
							sourceHandle: 'bottom',
							targetHandle: 'top',
							type: 'Edge',
							markerEnd: { type: MarkerType.ArrowClosed, width: 30, height: 30 }
						});
					}
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

		const node = getNodes().find(n => n.id === nodeId);
		const isLocked = node?.data.isLocked === '1';

		if (isLocked && savedNodePositions[nodeId]) {
			nodePositions[nodeId] = savedNodePositions[nodeId];
		} else {
			nodePositions[nodeId] = { x, y };
		}

		const children = nodeConnections[nodeId] || [];
		let childX = nodePositions[nodeId].x - (children.length - 1) * 75;

		children.forEach(childId => {
			calculatePositions(
				nodePositions,
				nodeConnections,
				nodeWidths,
				childId,
				childX,
				nodePositions[nodeId].y + 150
			);
			childX += (nodeWidths[childId] || 0) + 100;
		});

		// 重新调整子节点位置以避免重叠
		children.forEach(childId => {
			const childNode = nodePositions[childId];
			Object.keys(nodePositions).forEach(existingNodeId => {
				if (existingNodeId !== childId && nodePositions[existingNodeId].y === childNode.y) {
					const existingNodeX = nodePositions[existingNodeId].x;
					const existingNodeWidth = nodeWidths[existingNodeId] || 0;
					const currentNodeWidth = nodeWidths[childId] || 0;
					if (Math.abs(existingNodeX - childNode.x) < (existingNodeWidth + currentNodeWidth) / 2 + 100) {
						childNode.x = existingNodeX + (existingNodeWidth + currentNodeWidth) / 2 + 100;
					}
				}
			});
		});

		// 原有的避免重叠逻辑
		Object.keys(nodePositions).forEach(existingNodeId => {
			if (existingNodeId !== nodeId && nodePositions[existingNodeId].y === y) {
				const existingNodeX = nodePositions[existingNodeId].x;
				const existingNodeWidth = nodeWidths[existingNodeId] || 0;
				const currentNodeWidth = nodeWidths[nodeId] || 0;
				if (
					Math.abs(existingNodeX - nodePositions[nodeId].x) <
					(existingNodeWidth + currentNodeWidth) / 2 + 100
				) {
					nodePositions[nodeId].x = existingNodeX + (existingNodeWidth + currentNodeWidth) / 2 + 100;
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
