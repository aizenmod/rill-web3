import { useState } from 'react';
import { toast } from 'react-toastify';
import * as lighthouseStorage from './index';
import { useWebContainer } from '~/lib/webcontainer/useWebContainer';

// Mark as client-only to avoid SSR issues
export const clientOnly = true;

interface LighthouseButtonProps {
  className?: string;
}

export function LighthouseButton({ className = '' }: LighthouseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { webcontainer } = useWebContainer();
  
  // check for API key
  console.log('Lighthouse API key status:', import.meta.env.VITE_LIGHTHOUSE_API_KEY ? 'Found' : 'Not found');
  
  const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
  
  if (!apiKey) {
    console.warn('Lighthouse API key not found');
    return null;
  }

  const handleSaveToVault = async () => {
    if (!webcontainer) {
      toast.error('WebContainer not initialized');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Initialize Lighthouse SDK if needed
      await lighthouseStorage.init(apiKey);
      
      // First read all top-level items
      const files: string[] = [];
      const readAllFiles = async (dir: string) => {
        try {
          const entries = await webcontainer.fs.readdir(dir);
          for (const entry of entries) {
            const path = dir === '/' ? `/${entry}` : `${dir}/${entry}`;
            
            // Skip node_modules and .git directories
            if (path.includes('node_modules') || path.includes('.git')) {
              continue;
            }
            
            try {
              // Try to read as directory
              const subEntries = await webcontainer.fs.readdir(path);
              // It's a directory, so recursively read its contents
              await readAllFiles(path);
            } catch (e) {
              // If readdir fails, it's a file
              files.push(path);
            }
          }
        } catch (error) {
          console.error(`Error reading directory ${dir}:`, error);
        }
      };
      
      // Start recursive file collection from the root
      await readAllFiles('/');
      console.log(`Found ${files.length} files to save`);
      
      // Build a content object with file contents
      const contents: Record<string, string> = {};
      let successCount = 0;
      
      for (const filePath of files) {
        try {
          // Skip binary files and very large files
          if (filePath.match(/\.(jpg|jpeg|png|gif|ico|woff|woff2|eot|ttf|otf|mp4|webm|ogg|mp3|wav|flac|aac|zip|tar|gz|rar|exe|dll|so|dylib|class)$/i)) {
            continue;
          }
          
          // Read file content as text
          const content = await webcontainer.fs.readFile(filePath, 'utf-8');
          contents[filePath] = content;
          successCount++;
        } catch (error) {
          console.error(`Error reading file ${filePath}:`, error);
        }
      }
      
      // Create a project snapshot object
      const projectSnapshot = {
        timestamp: new Date().toISOString(),
        files: contents
      };
      
      if (successCount === 0) {
        toast.warning('No files were found to save');
        setIsLoading(false);
        return;
      }
      
      console.log(`Saving ${successCount} files to Lighthouse`);
      
      // Upload to Lighthouse
      const response = await lighthouseStorage.storeCodeSnapshot(projectSnapshot, apiKey);
      
      // Show success notification with the CID
      toast.success(
        <div>
          <p>Project saved to IPFS!</p>
          <p>CID: {response.data.Hash}</p>
          <p>Files saved: {successCount}</p>
          <a 
            href={`https://gateway.lighthouse.storage/ipfs/${response.data.Hash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View on IPFS
          </a>
        </div>,
        { autoClose: false }
      );
      
    } catch (error) {
      console.error('Failed to save to Lighthouse:', error);
      toast.error('Failed to save project to Lighthouse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSaveToVault}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors ${className}`}
    >
      {isLoading ? (
        <>
          <div className="i-svg-spinners:90-ring-with-bg text-white text-lg"></div>
          <span>Saving...</span>
        </>
      ) : (
        <>
          <div className="i-ph:cloud-arrow-up-duotone text-lg"></div>
          <span>Save to Vault</span>
        </>
      )}
    </button>
  );
} 