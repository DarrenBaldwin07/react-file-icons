import { FileIcon, type IconProps } from './icons';
import extensions from './extensions';
import fileNames from './fileNames';

type IconComponent = (props: IconProps) => JSX.Element;
type FileNamesMap = Record<string, IconComponent>;
type ExtensionsMap = Record<string, IconComponent>;

/**
 * Get the appropriate React icon component for a given file name or extension
 * @param fileName - The file name (with or without path) or just the extension
 * @returns React component for the file icon
 */
export function getFileIcon(fileName: string): IconComponent {
	// Remove any path and get just the filename
	const cleanFileName = fileName.split('/').pop() || fileName;

	// First, try to match by exact filename (more specific)
	const exactMatch = (fileNames as FileNamesMap)[cleanFileName.toLowerCase()];
	if (exactMatch) {
		return exactMatch;
	}

	// Extract extension from filename
	const extension = getFileExtension(cleanFileName);

	// Try to match by extension
	if (extension) {
		const extensionMatch = (extensions as ExtensionsMap)[extension.toLowerCase()];
		if (extensionMatch) {
			return extensionMatch;
		}
	}

	// Fallback to generic file icon
	return FileIcon;
}

/**
 * Extract file extension from a filename
 * @param fileName - The filename to extract extension from
 * @returns The file extension (without the dot) or null if no extension
 */
export function getFileExtension(fileName: string): string | null {
	// Handle compound extensions like .d.ts, .spec.ts, etc.
	const parts = fileName.split('.');
	
	if (parts.length < 2) {
		return null; // No extension
	}
	
	// For compound extensions, try the full compound first
	if (parts.length >= 3) {
		const compoundExtension = parts.slice(-2).join('.');
		if ((extensions as ExtensionsMap)[compoundExtension.toLowerCase()]) {
			return compoundExtension;
		}
	}
	
	// Return the last part as extension
	return parts[parts.length - 1];
}

/**
 * Check if a file has a specific extension
 * @param fileName - The filename to check
 * @param expectedExtension - The extension to check for (with or without dot)
 * @returns Boolean indicating if the file has the expected extension
 */
export function hasExtension(fileName: string, expectedExtension: string): boolean {
	const extension = getFileExtension(fileName);
	const cleanExpected = expectedExtension.startsWith('.') 
		? expectedExtension.slice(1) 
		: expectedExtension;
	
	return extension?.toLowerCase() === cleanExpected.toLowerCase();
}

/**
 * Get multiple icon suggestions for a filename (useful for fuzzy matching)
 * @param fileName - The filename to get suggestions for
 * @returns Array of possible icon components
 */
export function getFileIconSuggestions(fileName: string): IconComponent[] {
	const suggestions: IconComponent[] = [];
	const cleanFileName = fileName.split('/').pop() || fileName;

	// Add exact filename match
	const exactMatch = (fileNames as FileNamesMap)[cleanFileName.toLowerCase()];
	if (exactMatch) {
		suggestions.push(exactMatch);
	}

	// Add extension match
	const extension = getFileExtension(cleanFileName);
	if (extension) {
		const extensionMatch = (extensions as ExtensionsMap)[extension.toLowerCase()];
		if (extensionMatch && extensionMatch !== exactMatch) {
			suggestions.push(extensionMatch);
		}
	}

	// Add fallback if no matches
	if (suggestions.length === 0) {
		suggestions.push(FileIcon);
	}

	return suggestions;
}
