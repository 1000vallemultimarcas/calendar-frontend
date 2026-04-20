import { useEffect, useState } from "react";

/**
 * Custom hook to determine if a component has mounted on the client.
 * Useful for avoiding hydration mismatches when using client-only APIs
 * (like localStorage, window, or Date formatting).
 */
export function useHasMounted() {
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	return hasMounted;
}
