/**
 * Cleans up code content by removing unnecessary whitespace and comments
 */
export function cleanUpCode(code: string): string {
  if (!code) return '';
  
  // Remove leading/trailing whitespace
  let cleanedCode = code.trim();
  
  // Remove duplicate empty lines (more than 2 consecutive newlines)
  cleanedCode = cleanedCode.replace(/\n{3,}/g, '\n\n');
  
  return cleanedCode;
} 