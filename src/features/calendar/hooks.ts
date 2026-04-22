import { useEffect, useState } from "react";

export function useDisclosure({
	defaultIsOpen = false,
}: {
	defaultIsOpen?: boolean;
} = {}) {
	const [isOpen, setIsOpen] = useState(defaultIsOpen);

	const onOpen = () => setIsOpen(true);
	const onClose = () => setIsOpen(false);
	const onToggle = () => setIsOpen((currentValue) => !currentValue);

	return { onOpen, onClose, isOpen, onToggle, setIsOpen };
}

export const useLocalStorage = <T>(
	key: string,
	initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] => {
	const [storedValue, setStoredValue] = useState<T>(initialValue);

	useEffect(() => {
		if (typeof window === "undefined") return;

		try {
			const item = window.localStorage.getItem(key);
			if (item) {
				setStoredValue(JSON.parse(item) as T);
			}
		} catch (error) {
			console.warn(`Error reading localStorage key "${key}":`, error);
		}
	}, [key]);

	const [storedValue, setStoredValue] = useState<T>(initialValue);

	useEffect(() => {
		setStoredValue(readValue());
	}, [key]);

	const setValue = (value: T) => {
		try {
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			setStoredValue(valueToStore);
			if (typeof window !== "undefined") {
				window.localStorage.setItem(key, JSON.stringify(valueToStore));
			}
		} catch (error) {
			console.warn(`Error setting localStorage key "${key}":`, error);
		}
	};

	return [storedValue, setValue];
};

export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		if (media.matches !== matches) {
			setMatches(media.matches);
		}

		const listener = () => setMatches(media.matches);
		media.addEventListener("change", listener);

		return () => media.removeEventListener("change", listener);
	}, [matches, query]);

	return matches;
}
