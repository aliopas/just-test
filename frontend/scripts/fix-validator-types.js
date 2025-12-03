#!/usr/bin/env node

/**
 * This script fixes Next.js generated type files by ensuring they have
 * the React import statement. This is needed because Next.js generates
 * files without importing React, but uses React.ComponentType and React.ReactNode.
 * 
 * Run this script after build or add it to your build process.
 */

const fs = require('fs');
const path = require('path');

const nextTypesDir = path.join(__dirname, '../.next/types');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if React import already exists
  if (content.includes("import React from 'react'") || content.includes('import React from "react"')) {
    return false; // Already fixed
  }

  // Check if file uses React types (React.ComponentType, React.ReactNode, etc.)
  const usesReactTypes = /React\.(ComponentType|ReactNode|ReactElement)/.test(content);
  
  if (!usesReactTypes) {
    return false; // File doesn't use React types
  }

  // Find where to add the import - after comment block but before first import
  const lines = content.split('\n');
  let insertIndex = -1;
  
  // Skip comment lines at the start
  let foundCommentBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('//')) {
      foundCommentBlock = true;
      continue;
    }
    
    if (foundCommentBlock && (line === '' || line.startsWith('import'))) {
      // Insert after comments, before first import or empty line
      insertIndex = line.startsWith('import') ? i : i + 1;
      break;
    }
    
    if (!foundCommentBlock && line.startsWith('import')) {
      insertIndex = i;
      break;
    }
  }

  if (insertIndex === -1) {
    insertIndex = 0; // Fallback to start
  }

  // Insert React import
  lines.splice(insertIndex, 0, "import React from 'react'");
  const fixedContent = lines.join('\n');

  // Write the fixed content back
  fs.writeFileSync(filePath, fixedContent, 'utf8');
  return true;
}

function fixAllTypeFiles() {
  if (!fs.existsSync(nextTypesDir)) {
    console.log('⚠️  .next/types directory not found, skipping fix');
    return;
  }

  let fixedCount = 0;

  // Fix validator.ts
  const validatorPath = path.join(nextTypesDir, 'validator.ts');
  if (fixFile(validatorPath)) {
    console.log('✅ Fixed validator.ts - added React import');
    fixedCount++;
  }

  // Fix all layout.ts and page.ts files in app subdirectories
  const appDir = path.join(nextTypesDir, 'app');
  if (fs.existsSync(appDir)) {
    function walkDir(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file === 'layout.ts' || file === 'page.ts') {
          if (fixFile(filePath)) {
            const relativePath = path.relative(nextTypesDir, filePath);
            console.log(`✅ Fixed ${relativePath} - added React import`);
            fixedCount++;
          }
        }
      }
    }
    
    walkDir(appDir);
  }

  if (fixedCount === 0) {
    console.log('✅ All type files already have React import or don\'t need it');
  } else {
    console.log(`\n✅ Fixed ${fixedCount} file(s)`);
  }
}

fixAllTypeFiles();

