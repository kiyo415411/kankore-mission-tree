import { Handle, Position, useReactFlow } from '@xyflow/react';
import clsx from 'clsx';
import { updateURL } from '../hook/useFlowState';
import { useAdmin } from '../contexts/PermissionContext';

const longLength = '100%';
const shotLength = '10px';

interface NodeData {
	label: string;
	bgColor: string;
	isFlipped?: boolean;
}

const FlipRectangleNode = ({ id, data }: { id: string; data: NodeData }) => {
	const isFlipped = data.isFlipped || false;
	const { setNodes } = useReactFlow();
	const { isAdmin } = useAdmin();
	const cursorStyle = isAdmin ? 'crosshair' : 'default';

	const onNodeClick = () => {
		setNodes(prevNodes => {
			const newNodes = prevNodes.map(n =>
				n.id === id ? { ...n, data: { ...n.data, isFlipped: !n.data.isFlipped } } : n
			);
			updateURL(newNodes);
			return newNodes;
		});
	};

	const nodeContent = (
		<div style={{ perspective: '1000px', width: 240 }} className="h-48 rounded-8">
			<div
				className="w-full h-full relative rounded-8"
				style={{
					transformStyle: 'preserve-3d',
					transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
					transition: 'transform 0.6s',
					color: '#1e1e1e'
				}}
				onClick={onNodeClick}
			>
				<div
					className={clsx(
						'w-full h-full rounded-8 flex flex-col justify-center items-center whitespace-no-wrap relative'
					)}
					style={{
						transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
						backgroundColor: data.bgColor,
						color: '#1e1e1e'
					}}
				>
					{isFlipped && (
						<div
							className="absolute inset-0 rounded-8"
							style={{
								backgroundColor: 'rgba(255, 255, 255, 0.4)',
								pointerEvents: 'none'
							}}
						/>
					)}
					<span className="relative z-10">{id}</span>
					<pre className="relative z-10 whitespace-pre-wrap overflow-auto max-w-full text-center px-8">
						{data.label}
					</pre>
				</div>
			</div>

			<Handle
				id={Position.Bottom}
				type="source"
				position={Position.Bottom}
				style={{
					left: '50%',
					bottom: 0,
					transform: 'translateX(-50%)',
					backgroundColor: 'transparent',
					borderColor: 'transparent',
					width: longLength,
					height: shotLength,
					cursor: cursorStyle
				}}
			/>
			<Handle
				id={Position.Top}
				type="target"
				position={Position.Top}
				style={{
					left: '50%',
					top: 0,
					transform: 'translateX(-50%)',
					backgroundColor: 'transparent',
					borderColor: 'transparent',
					width: longLength,
					height: shotLength,
					cursor: cursorStyle
				}}
			/>
			<Handle
				id={Position.Left}
				type="target"
				position={Position.Left}
				style={{
					top: '50%',
					left: 0,
					transform: 'translateY(-50%)',
					backgroundColor: 'transparent',
					borderColor: 'transparent',
					height: longLength,
					width: shotLength,
					cursor: cursorStyle
				}}
			/>
			<Handle
				id={Position.Right}
				type="source"
				position={Position.Right}
				style={{
					top: '50%',
					right: 0,
					transform: 'translateY(-50%)',
					backgroundColor: 'transparent',
					borderColor: 'transparent',
					height: longLength,
					width: shotLength,
					cursor: cursorStyle
				}}
			/>
		</div>
	);

	return nodeContent;
};

export default FlipRectangleNode;
