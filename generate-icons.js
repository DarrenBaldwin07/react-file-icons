#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, 'icons');
const OUTPUT_FILE = path.join(__dirname, 'src', 'icons.tsx');

function toPascalCase(str) {
	return str
		.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
		.replace(/^(.)/, (char) => char.toUpperCase())
		.replace(/[^a-zA-Z0-9]/g, '');
}

function cleanSvgForReact(svgContent) {
	return (
		svgContent
			// Remove XML declaration if present
			.replace(/<\?xml[^>]*\?>\s*/g, '')
			// Convert HTML attributes to React format
			.replace(/fill-rule/g, 'fillRule')
			.replace(/clip-rule/g, 'clipRule')
			.replace(/clip-path/g, 'clipPath')
			.replace(/stroke-width/g, 'strokeWidth')
			.replace(/stroke-dasharray/g, 'strokeDasharray')
			.replace(/stroke-linecap/g, 'strokeLinecap')
			.replace(/stroke-linejoin/g, 'strokeLinejoin')
			.replace(
				/color-interpolation-filters/g,
				'colorInterpolationFilters',
			)
			.replace(/flood-opacity/g, 'floodOpacity')
			.replace(/fill-opacity/g, 'fillOpacity')
			.replace(/stop-color/g, 'stopColor')
			.replace(/stop-opacity/g, 'stopOpacity')
			.replace(/data-name/g, 'data-name') // Keep data-name as is
			.replace(/view-box/g, 'viewBox')
			// Handle class -> className
			.replace(/\sclass="/g, ' className="')
			// Handle <style> tags - wrap CSS content in JSX expression
			.replace(/<style>([^<]*)<\/style>/g, '<style>{`$1`}</style>')
			// Handle style attributes - convert to React style objects
			.replace(/style="([^"]*)"/g, (match, styleContent) => {
				const styleObj = styleContent
					.split(';')
					.filter((s) => s.trim())
					.map((s) => s.split(':'))
					.reduce((obj, [key, value]) => {
						if (key && value) {
							const camelKey = key
								.trim()
								.replace(/-([a-z])/g, (g) =>
									g[1].toUpperCase(),
								);
							obj[camelKey] = value.trim();
						}
						return obj;
					}, {});

				const styleString = Object.entries(styleObj)
					.map(([k, v]) => `${k}: '${v}'`)
					.join(', ');

				return `style={{ ${styleString} }}`;
			})
			// Convert double quotes to single quotes for attributes
			.replace(/(\w+)="([^"]*)"/g, "$1='$2'")
			// Fix the style object quotes back
			.replace(/style='\{ ([^}]*) \}'/g, 'style={{ $1 }}')
	);
}

function createReactComponent(svgContent, componentName) {
	const cleanedSvg = cleanSvgForReact(svgContent.trim());
	// Simple replacement - let prettier handle formatting
	const svgWithProps = cleanedSvg.replace('<svg', '<svg {...props}');

	return `export function ${componentName}(props: IconProps) {
	return ${svgWithProps};
}`;
}

async function generateIconsFile() {
	try {
		console.log('🔍 Reading SVG files from icons directory...');

		// Get all SVG files
		const files = fs
			.readdirSync(ICONS_DIR)
			.filter((file) => file.endsWith('.svg'))
			.sort(); // Sort alphabetically for consistent output

		console.log(`📁 Found ${files.length} SVG files`);

		let componentsCode = `import React from 'react';\n\nexport interface IconProps extends React.SVGProps<SVGSVGElement> {}\n\n`;
		const seenComponents = new Set();
		let processedCount = 0;

		// Process each SVG file
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const filePath = path.join(ICONS_DIR, file);

			try {
				const svgContent = fs.readFileSync(filePath, 'utf8');
				const baseName = path.basename(file, '.svg');
				const componentName = toPascalCase(baseName) + 'Icon';

				// Skip duplicates
				if (seenComponents.has(componentName)) {
					console.log(
						`⚠️ Skipping duplicate: ${componentName} (from ${file})`,
					);
					continue;
				}

				seenComponents.add(componentName);
				processedCount++;

				const componentCode = createReactComponent(
					svgContent,
					componentName,
				);
				componentsCode += componentCode;

				// Add spacing between components (except for the last one)
				if (i < files.length - 1) {
					componentsCode += '\n\n';
				}

				// Progress indicator
				if ((i + 1) % 50 === 0 || i === files.length - 1) {
					console.log(`⚡ Processed ${i + 1}/${files.length} files`);
				}
			} catch (error) {
				console.error(`❌ Error processing ${file}:`, error.message);
				continue;
			}
		}

		// No need for export block - each component is already exported individually

		// Write the file
		console.log('📝 Writing icons.tsx file...');
		fs.writeFileSync(OUTPUT_FILE, componentsCode);

		console.log(
			`✅ Successfully generated ${processedCount} icon components in ${OUTPUT_FILE}`,
		);
		console.log(`📊 Statistics:`);
		console.log(`   - Total SVG files: ${files.length}`);
		console.log(`   - Successfully processed: ${processedCount}`);
		console.log(`   - Failed: ${files.length - processedCount}`);

		// Show some examples
		console.log(`\n🎯 Generated components like:`);
		console.log(`   - TypescriptIcon, JavascriptIcon, ReactTsIcon`);
		console.log(`   - VueIcon, PythonIcon, HtmlIcon, CssIcon`);
		if (processedCount > 7) {
			console.log(`   ... and ${processedCount - 7} more`);
		}

		console.log(`\n🚀 You can now import and use the icons like:`);
		console.log(
			`   import { TypescriptIcon, ReactIcon, VueIcon } from './icons';`,
		);
		console.log(`   <TypescriptIcon className="icon" />`);
	} catch (error) {
		console.error('❌ Error generating icons:', error.message);
		process.exit(1);
	}
}

// Run the script
console.log('🎨 React File Icons Generator');
console.log('=============================');
generateIconsFile();
