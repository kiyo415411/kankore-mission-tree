import React, { useRef, useState } from 'react';
import { EdgeProps, getSmoothStepPath, useReactFlow } from '@xyflow/react';
import clsx from 'clsx';
import Icon from '@mui/material/Icon';
import { useAdmin } from '../contexts/PermissionContext';
import { Popover, MenuItem, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
	popoverPaper: {
		boxShadow: 'none',
		backgroundColor: 'transparent !important'
	},
	menuItem: {
		textAlign: 'center',
		color: '#1e1e1e !important',
		backgroundColor: '#666 !important',
		padding: '0 8px 0 8px !important',
		margin: '0 !important',
		'&:hover': {
			backgroundColor: '#777 !important'
		},
		transition: 'all 0.2s ease-in-out !important'
	}
}));

function Edge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style,
	markerEnd,
	markerStart
}: EdgeProps) {
	const classes = useStyles();
	const { isAdmin } = useAdmin();
	const { setEdges } = useReactFlow();
	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition
	});

	const [menu, setMenu] = useState(null);
	const { current: menuClick } = useRef((event: any) => {
		setMenu(event.currentTarget);
		setIsDeleteButton(true);
	});
	const { current: menuClose } = useRef(() => {
		setMenu(null);
		setIsDeleteButton(false);
	});

	const [isDeleteButton, setIsDeleteButton] = useState(false);

	const handleMouseEnter = () => {
		if (!isAdmin) return;
		setIsDeleteButton(true);
	};

	const handleMouseLeave = () => {
		if (!isAdmin) return;
		if (!menu) {
			setIsDeleteButton(false);
		}
	};

	const handleDelete = (event: React.MouseEvent) => {
		menuClose();
		if (!isAdmin) return;
		event.stopPropagation();
		setEdges((eds: any) => eds.filter((e: any) => e.id !== id));
	};

	const handleSwitch = (event: React.MouseEvent) => {
		menuClose();
		if (!isAdmin) return;
		event.stopPropagation();
		setEdges(eds => {
			return eds.map(e => {
				if (e.id === id) {
					const newEdge = { ...e };
					if (newEdge.markerEnd) {
						newEdge.markerStart = newEdge.markerEnd;
						newEdge.markerEnd = undefined;
					} else if (newEdge.markerStart) {
						newEdge.markerEnd = newEdge.markerStart;
						newEdge.markerStart = undefined;
					}
					return newEdge;
				}
				return e;
			});
		});
	};

	return (
		<>
			<path
				id={id}
				style={style}
				className="react-flow__edge-path"
				d={edgePath}
				markerEnd={markerEnd}
				markerStart={markerStart}
			/>
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
				transform={`translate(${labelX}, ${labelY})`}
				onClick={menuClick}
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
			<Popover
				open={Boolean(menu)}
				anchorEl={menu}
				onClose={menuClose}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left'
				}}
				classes={{
					paper: classes.popoverPaper
				}}
			>
				<MenuItem onClick={handleDelete} className={classes.menuItem}>
					<ListItemText primary="remove" />
				</MenuItem>
				<MenuItem onClick={handleSwitch} className={classes.menuItem}>
					<ListItemText primary="switch" />
				</MenuItem>
			</Popover>
		</>
	);
}

export default Edge;
