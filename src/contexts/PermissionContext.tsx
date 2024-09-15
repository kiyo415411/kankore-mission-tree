import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AdminContextType {
	isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		setIsAdmin(window.location.pathname.includes('/admin/'));
	}, []);

	return <AdminContext.Provider value={{ isAdmin }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
	const context = useContext(AdminContext);
	if (context === undefined) {
		throw new Error('useAdmin must be used within an PermissionProvider');
	}
	return context;
}
