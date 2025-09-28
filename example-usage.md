# Usage Examples

## Basic Usage

```tsx
import React from 'react';
import { getFileIcon } from './src/helpers';

function FileItem({ fileName }: { fileName: string }) {
  const IconComponent = getFileIcon(fileName);
  
  return (
    <div>
      <IconComponent />
      <span>{fileName}</span>
    </div>
  );
}

// Example usage:
<FileItem fileName="package.json" />        // Returns NodeIcon
<FileItem fileName="tsconfig.json" />       // Returns TsconfigIcon  
<FileItem fileName="README.md" />           // Returns ReadmeIcon
<FileItem fileName="style.css" />           // Returns CssIcon
<FileItem fileName="unknown.xyz" />         // Returns FileIcon (fallback)
```

## Available Helper Functions

- `getFileIcon(fileName: string)` - Main function to get icon component
- `getFileExtension(fileName: string)` - Extract file extension
- `hasExtension(fileName, extension)` - Check if file has specific extension
- `getFileIconSuggestions(fileName)` - Get multiple icon suggestions

## Direct Access to Mappings

```tsx
import { extensions, fileNames } from './src';

// Direct access to mappings if needed
const jsIcon = extensions['js'];
const packageIcon = fileNames['package.json'];
```
