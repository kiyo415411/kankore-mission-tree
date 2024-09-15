import { useCallback, useState, useEffect } from 'react';
import { ReactFlow, MiniMap, Background, ConnectionLineType, Node, NodeChange, EdgeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowState } from '../hook/useFlowState';
import FlipRectangleNode from './FlipRectangleNode';
import { useAdmin } from '../contexts/PermissionContext';
import ExControls from './ExControls';
import Edge from './Edge';

export const nodeTypes = {
	FlipRectangleNode: FlipRectangleNode
};

export const edgeTypes = {
	Edge: Edge
};

function Flow() {
	const { edges, nodes, onEdgesChange, onNodesChange, onConnect, onReconnect, setEdges, setNodes } = useFlowState();
	const { isAdmin } = useAdmin();

	const [history, setHistory] = useState<{ nodes: Node[]; edges: any[] }[]>([]);
	const [redoStack, setRedoStack] = useState<{ nodes: Node[]; edges: any[] }[]>([]);

	const addToHistory = (newState: { nodes: Node[]; edges: any[] }) => {
		setHistory(prev => [...prev, newState]);
		setRedoStack([]);
	};

	const undo = useCallback(() => {
		if (history.length > 0) {
			const lastState = history[history.length - 1];
			setRedoStack(prev => [lastState, ...prev]);
			setHistory(prev => prev.slice(0, -1));
			setNodes(lastState.nodes);
			setEdges(lastState.edges);
		}
	}, [history]);

	const redo = useCallback(() => {
		if (redoStack.length > 0) {
			const nextState = redoStack[0];
			setHistory(prev => [...prev, nextState]);
			setRedoStack(prev => prev.slice(1));
			setNodes(nextState.nodes);
			setEdges(nextState.edges);
		}
	}, [redoStack]);

	const handleNodesChange = (changes: NodeChange[]) => {
		onNodesChange(changes);
		addToHistory({ nodes, edges });
	};

	const handleEdgesChange = (changes: EdgeChange[]) => {
		onEdgesChange(changes);
		addToHistory({ nodes, edges });
	};

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.metaKey || event.ctrlKey) {
				if (event.key === 'z' && !event.shiftKey) {
					event.preventDefault();
					undo();
				} else if (event.key === 'z' && event.shiftKey) {
					event.preventDefault();
					redo();
				}
			}
		},
		[undo, redo]
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyDown]);

	return (
		<div className="w-screen h-screen relative">
			<div className="w-full h-full">
				<ReactFlow
					edges={edges}
					nodes={nodes}
					fitView={true}
					fitViewOptions={{ maxZoom: 1 }}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					onNodesChange={handleNodesChange}
					onEdgesChange={isAdmin ? handleEdgesChange : undefined}
					onConnect={isAdmin ? onConnect : undefined}
					onReconnect={isAdmin ? onReconnect : undefined}
					connectionLineType={ConnectionLineType.Step}
					nodesConnectable={isAdmin}
					nodesDraggable={isAdmin}
					snapToGrid
					snapGrid={[1, 1]}
					selectionKeyCode="Meta"
					multiSelectionKeyCode="Control"
				>
					<ExControls />
					<div className="absolute right-0 bottom-0">
						<div
							className="border-1 border-white relative rounded-8 m-10 overflow-hidden"
							style={{ height: 150, width: 200 }}
						>
							<MiniMap
								zoomable
								pannable
								nodeColor={(node: any) => {
									const baseColor = node.data.bgColor;
									if (node.data.isFlipped) {
										const r = parseInt(baseColor.slice(1, 3), 16);
										const g = parseInt(baseColor.slice(3, 5), 16);
										const b = parseInt(baseColor.slice(5, 7), 16);

										const lightenFactor = 0.4;
										const newR = Math.min(255, r + (255 - r) * lightenFactor);
										const newG = Math.min(255, g + (255 - g) * lightenFactor);
										const newB = Math.min(255, b + (255 - b) * lightenFactor);

										return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
									}
									return baseColor;
								}}
								bgColor="#1e1e1e"
								maskColor="transparent"
							/>
						</div>
					</div>

					<Background style={{ backgroundColor: '#1e1e1e' }} gap={9999} />
				</ReactFlow>
			</div>
		</div>
	);
}

export default Flow;
