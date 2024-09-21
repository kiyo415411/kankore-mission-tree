import CanvasFlow from './components/canvas/CanvasFlow';
import Flow from './components/Flow';
import { PermissionProvider } from './contexts/PermissionContext';

function App() {
	return (
		<PermissionProvider>
			{/* <Flow /> */}
			<CanvasFlow />
		</PermissionProvider>
	);
}

export default App;
