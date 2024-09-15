import React, { useState } from 'react';
import { EdgeProps, getSmoothStepPath, useReactFlow } from '@xyflow/react';
import clsx from 'clsx';
import Icon from '@mui/material/Icon';
import { useAdmin } from '../contexts/PermissionContext';

const Edge = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd
}: EdgeProps) => {
	const { isAdmin } = useAdmin();
	const { setEdges } = useReactFlow();
	const [edgePath] = getSmoothStepPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition
	});

	const [isDeleteButton, setIsDeleteButton] = useState(false);

	const handleMouseEnter = () => {
		if (!isAdmin) return;
		setIsDeleteButton(true);
	};

	const handleMouseLeave = () => {
		if (!isAdmin) return;

		setIsDeleteButton(false);
	};

	const handleDelete = (event: React.MouseEvent) => {
		if (!isAdmin) return;
		event.stopPropagation();
		setEdges((eds: any) => eds.filter((e: any) => e.id !== id));
	};

	return (
		<>
			<path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
			<path
				d={edgePath}
				fill="none"
				stroke="transparent"
				strokeWidth={20}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			/>
			<g
				className={clsx(
					'react-flow__edge-textwrapper cursor-pointer transition-opacity duration-200',
					isDeleteButton ? 'opacity-100' : 'opacity-0'
				)}
				transform={`translate(${(sourceX + targetX) / 2}, ${(sourceY + targetY) / 2})`}
				onClick={handleDelete}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				style={{ pointerEvents: 'all' }}
			>
				<foreignObject width={40} height={40} x="-20" y="-15">
					<span
						className="rounded-full p-1 flex items-center justify-center"
						style={{ backgroundColor: '#1e1e1e' }}
					>
						<Icon className="text-white">cancel</Icon>
					</span>
				</foreignObject>
			</g>
		</>
	);
};

export default Edge;
