import { useEffect, useRef, useState } from 'react';

interface Node {
	x: number;
	y: number;
	text: string;
	flipped: boolean;
	flipProgress: number;
	flipStartTime: number | null;
	flipCount: number;
	totalFlips: number;
}

// 简化缓动函数
const easeInOut = (t: number): number => {
	return t * (2 - t);
};

function CanvasFlow() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const nodesRef = useRef<Node[]>([
		{ x: 300, y: 50, text: '1', flipped: false, flipProgress: 0, flipStartTime: null, flipCount: 0, totalFlips: 0 },
		{
			x: 150,
			y: 150,
			text: '2',
			flipped: false,
			flipProgress: 0,
			flipStartTime: null,
			flipCount: 0,
			totalFlips: 0
		},
		{
			x: 450,
			y: 150,
			text: '3',
			flipped: false,
			flipProgress: 0,
			flipStartTime: null,
			flipCount: 0,
			totalFlips: 0
		},
		{ x: 0, y: 250, text: '4', flipped: false, flipProgress: 0, flipStartTime: null, flipCount: 0, totalFlips: 0 },
		{ x: 300, y: 250, text: '5', flipped: false, flipProgress: 0, flipStartTime: null, flipCount: 0, totalFlips: 0 }
	]);

	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [scale, setScale] = useState(1);
	const isDragging = useRef(false);
	const lastPosition = useRef({ x: 0, y: 0 });

	const handleClick = (event: MouseEvent) => {
		const rect = canvasRef.current!.getBoundingClientRect();
		const clickX = (event.clientX - rect.left - offset.x) / scale;
		const clickY = (event.clientY - rect.top - offset.y) / scale;

		const cardWidth = 200;
		const cardHeight = 60;

		nodesRef.current = nodesRef.current.map(node => {
			const halfWidth = cardWidth / 2;
			const halfHeight = cardHeight / 2;

			if (
				clickX >= node.x - halfWidth &&
				clickX <= node.x + halfWidth &&
				clickY >= node.y - halfHeight &&
				clickY <= node.y + halfHeight
			) {
				return {
					...node,
					flipped: !node.flipped,
					flipProgress: 0,
					flipStartTime: performance.now(),
					flipCount: node.flipCount + 1,
					totalFlips: node.totalFlips + 1
				};
			}
			return node;
		});
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		resizeCanvas();
		window.addEventListener('resize', resizeCanvas);

		const drawNode = (node: Node) => {
			ctx.save();
			ctx.translate(node.x * scale + offset.x, node.y * scale + offset.y);
			ctx.scale(scale, scale);

			const flipProgress = easeInOut(node.flipProgress);
			const angle = flipProgress * Math.PI * 2;

			const perspective = 800;
			const cardWidth = 200;
			const cardHeight = 60;

			ctx.save();
			ctx.transform(1, Math.sin(angle) / perspective, 0, Math.cos(angle), 0, 0);

			if (
				(node.flipCount % 2 === 0 && Math.cos(angle) > 0) ||
				(node.flipCount % 2 !== 0 && Math.cos(angle) < 0)
			) {
				// 正面
				ctx.fillStyle = '#4CAF50';
				ctx.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
				ctx.fillStyle = 'white';
				ctx.font = 'bold 24px Arial';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(node.text, 0, 0);
			} else {
				// 背面
				ctx.fillStyle = '#FF6347';
				ctx.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
				ctx.fillStyle = 'white';
				ctx.font = 'bold 24px Arial';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText('?', 0, 0);
			}

			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);

			ctx.restore();
			ctx.restore();
		};

		const drawConnection = (startX: number, startY: number, endX: number, endY: number) => {
			ctx.beginPath();
			ctx.moveTo(startX * scale + offset.x, startY * scale + offset.y);
			ctx.lineTo(startX * scale + offset.x, endY * scale + offset.y);
			ctx.lineTo(endX * scale + offset.x, endY * scale + offset.y);
			ctx.strokeStyle = '#333';
			ctx.stroke();
		};

		const drawAll = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// 繪製連接線
			drawConnection(nodesRef.current[0].x, nodesRef.current[0].y, nodesRef.current[1].x, nodesRef.current[1].y);
			drawConnection(nodesRef.current[0].x, nodesRef.current[0].y, nodesRef.current[2].x, nodesRef.current[2].y);
			drawConnection(nodesRef.current[1].x, nodesRef.current[1].y, nodesRef.current[3].x, nodesRef.current[3].y);
			drawConnection(nodesRef.current[2].x, nodesRef.current[2].y, nodesRef.current[4].x, nodesRef.current[4].y);

			// 繪製節點
			nodesRef.current.forEach(drawNode);
		};

		const animate = () => {
			const currentTime = performance.now();
			drawAll();
			nodesRef.current = nodesRef.current.map(node => {
				if (node.flipStartTime !== null) {
					const elapsedTime = currentTime - node.flipStartTime;
					const duration = 700; // 翻转速度
					const newProgress = Math.min(elapsedTime / duration, 1);
					if (newProgress === 1) {
						return {
							...node,
							flipProgress: 0,
							flipStartTime: null,
							totalFlips: node.totalFlips + 1
						};
					}
					return { ...node, flipProgress: newProgress };
				}
				return node;
			});
			requestAnimationFrame(animate);
		};

		const handleMouseDown = (event: MouseEvent) => {
			isDragging.current = true;
			lastPosition.current = { x: event.clientX, y: event.clientY };
		};

		const handleMouseMove = (event: MouseEvent) => {
			if (!isDragging.current) return;
			const dx = event.clientX - lastPosition.current.x;
			const dy = event.clientY - lastPosition.current.y;
			setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
			lastPosition.current = { x: event.clientX, y: event.clientY };
		};

		const handleMouseUp = () => {
			isDragging.current = false;
		};

		const handleWheel = (event: WheelEvent) => {
			event.preventDefault();
			const zoomIntensity = 0.1;
			const delta = event.deltaY > 0 ? -zoomIntensity : zoomIntensity;
			const newScale = Math.max(0.1, scale + delta);

			const rect = canvas.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;

			const newOffsetX = mouseX - (mouseX - offset.x) * (newScale / scale);
			const newOffsetY = mouseY - (mouseY - offset.y) * (newScale / scale);

			setScale(newScale);
			setOffset({ x: newOffsetX, y: newOffsetY });
		};

		canvas.addEventListener('mousedown', handleMouseDown);
		canvas.addEventListener('mousemove', handleMouseMove);
		canvas.addEventListener('mouseup', handleMouseUp);
		canvas.addEventListener('mouseleave', handleMouseUp);
		canvas.addEventListener('wheel', handleWheel);
		canvas.addEventListener('click', handleClick);

		animate();

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			canvas.removeEventListener('mousedown', handleMouseDown);
			canvas.removeEventListener('mousemove', handleMouseMove);
			canvas.removeEventListener('mouseup', handleMouseUp);
			canvas.removeEventListener('mouseleave', handleMouseUp);
			canvas.removeEventListener('wheel', handleWheel);
			canvas.removeEventListener('click', handleClick);
		};
	}, [offset, scale]);

	return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }}></canvas>;
}

export default CanvasFlow;
