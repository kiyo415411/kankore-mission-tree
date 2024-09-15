import { useEffect, useCallback } from 'react';
import {
	Node,
	Edge,
	useNodesState,
	useEdgesState,
	Connection,
	addEdge,
	MarkerType,
	reconnectEdge
} from '@xyflow/react';
import * as LZString from 'lz-string';
import InitialNodes from '../constants/InitialNodes.json';
import InitialEdges from '../constants/InitialEdges.json';

export function encodeFlippedNodes(nodes: Node[]): string {
	const binary = nodes.map(node => (node.data.isFlipped ? '1' : '0')).join('');
	return LZString.compressToEncodedURIComponent(binary);
}

export function decodeFlippedNodes(encoded: string): boolean[] {
	const binary = LZString.decompressFromEncodedURIComponent(encoded);
	return binary.split('').map(bit => bit === '1');
}

export function updateURL(nodes: Node[]) {
	const encoded = encodeFlippedNodes(nodes);
	const newURL = `${window.location.pathname}?f=${encoded}`;
	window.history.replaceState({}, '', newURL);
}

export function useFlowState() {
	const [nodes, setNodes, onNodesChange] = useNodesState(InitialNodes as Node[]);
	const [edges, setEdges, onEdgesChange] = useEdgesState(InitialEdges as Edge[]);

	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const encoded = searchParams.get('f');
		if (encoded) {
			const flippedStates = decodeFlippedNodes(encoded);
			setNodes(prevNodes =>
				prevNodes.map((node, index) => ({
					...node,
					data: {
						...node.data,
						isFlipped: flippedStates[index] || false
					}
				}))
			);
		} else {
			updateURL(InitialNodes);
		}
	}, []);

	const onConnect = useCallback((params: Edge | Connection) => {
		const newEdge: Edge = {
			...params,
			id: `${params.source}-${params.target}`,
			type: 'Edge',
			markerEnd: {
				type: MarkerType.ArrowClosed,
				width: 15,
				height: 15
			}
		};
		setEdges(eds => addEdge(newEdge, eds));
	}, []);

	const onReconnect = useCallback(
		(oldEdge: any, newConnection: any) => setEdges(els => reconnectEdge(oldEdge, newConnection, els)),
		[]
	);

	return { nodes, edges, setNodes, setEdges, onEdgesChange, onNodesChange, onConnect, onReconnect };
}
