import Flow from './components/Flow';
import { PermissionProvider } from './contexts/PermissionContext';

function App() {
	return (
		<PermissionProvider>
			<Flow />
		</PermissionProvider>
	);
}

export default App;
