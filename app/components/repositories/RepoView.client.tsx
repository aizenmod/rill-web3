import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@remix-run/react';
import { useRepositoryDb } from '~/lib/repositories/useRepositoryDb';
import type { Repository } from './RepoList.client';
import { toast } from 'react-toastify';

// Mark as client only
export const clientOnly = true;

type FileItem = {
  path: string;
  content: string;
};

interface RepoViewProps {
  cid: string;
}

export function RepoView({ cid }: RepoViewProps) {
  const navigate = useNavigate();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const { getRepositoryByCid } = useRepositoryDb();

  useEffect(() => {
    const loadRepository = async () => {
      try {
        setIsLoading(true);
        const repo = await getRepositoryByCid(cid);
        
        if (!repo) {
          toast.error('Repository not found');
          navigate('/repositories');
          return;
        }
        
        setRepository(repo);
        
        // Fetch files from Lighthouse
        try {
          const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`);
          const data = await response.json();
          
          if (data && data.files) {
            const fileItems: FileItem[] = Object.entries(data.files).map(([path, content]) => ({
              path,
              content: content as string,
            }));
            
            setFiles(fileItems);
            
            // Set the first file as selected by default
            if (fileItems.length > 0) {
              setSelectedFile(fileItems[0]);
            }
          }
        } catch (error) {
          console.error('Failed to fetch repository files:', error);
          toast.error('Failed to load repository files');
        }
      } catch (error) {
        console.error('Failed to load repository:', error);
        toast.error('Failed to load repository');
        navigate('/repositories');
      } finally {
        setIsLoading(false);
      }
    };

    loadRepository();
  }, [cid, getRepositoryByCid, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="i-svg-spinners:90-ring-with-bg text-[var(--rill-primary)] text-2xl"></div>
        <span className="ml-2 text-[var(--rill-text-secondary)]">Loading repository...</span>
      </div>
    );
  }

  if (!repository) {
    return null; // Will navigate away
  }

  const formattedDate = new Date(repository.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Group files by directory
  const fileTree: Record<string, FileItem[]> = {};
  files.forEach((file) => {
    const parts = file.path.split('/');
    const dir = parts.length > 2 ? parts.slice(0, -1).join('/') : '/';
    
    if (!fileTree[dir]) {
      fileTree[dir] = [];
    }
    
    fileTree[dir].push(file);
  });

  return (
    <div>
      <div className="flex items-center mb-8 gap-2">
        <Link 
          to="/repositories" 
          className="text-[var(--rill-text-secondary)] hover:text-[var(--rill-text-primary)] transition-colors flex items-center gap-1"
        >
          <div className="i-ph:arrow-left"></div>
          <span>Repositories</span>
        </Link>
        <div className="text-[var(--rill-text-secondary)]">/</div>
        <h1 className="text-2xl font-bold text-[var(--rill-text-primary)]">
          {repository.name || 'Unnamed Project'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[var(--rill-border-color)] mb-6">
        <div className="p-5 border-b border-[var(--rill-border-color)]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-medium text-[var(--rill-text-primary)] flex items-center gap-2">
                <div className="i-ph:code-duotone text-xl text-[var(--rill-primary)]"></div>
                {repository.name || 'Unnamed Project'}
              </h2>
              
              {repository.description && (
                <p className="text-[var(--rill-text-secondary)] mt-2">
                  {repository.description}
                </p>
              )}
            </div>
            
            <a 
              href={`https://gateway.lighthouse.storage/ipfs/${repository.cid}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium bg-[var(--rill-primary)] text-white hover:bg-[var(--rill-primary-dark)] transition-colors"
              title="View raw data on IPFS"
            >
              <div className="i-ph:globe-duotone text-lg"></div>
              <span>View on IPFS</span>
            </a>
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-[var(--rill-text-secondary)]">
            <div className="flex items-center gap-1">
              <div className="i-ph:file-duotone text-lg"></div>
              <span>{repository.fileCount} files</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="i-ph:calendar-duotone text-lg"></div>
              <span>Updated on {formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="i-ph:key-duotone text-lg"></div>
              <span>CID: {repository.cid.substring(0, 8)}...{repository.cid.substring(repository.cid.length - 8)}</span>
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="w-1/4 border-r border-[var(--rill-border-color)] p-3">
            <div className="text-sm font-medium text-[var(--rill-text-primary)] mb-2">Files</div>
            
            <div className="overflow-y-auto max-h-[500px]">
              {Object.entries(fileTree).map(([dir, dirFiles]) => (
                <div key={dir} className="mb-3">
                  {dir !== '/' && (
                    <div className="text-xs font-medium text-[var(--rill-text-secondary)] mb-1 flex items-center">
                      <div className="i-ph:folder text-lg mr-1"></div>
                      {dir}
                    </div>
                  )}
                  <ul className="space-y-1">
                    {dirFiles.map((file) => (
                      <li key={file.path}>
                        <button
                          onClick={() => setSelectedFile(file)}
                          className={`text-xs w-full text-left px-2 py-1 rounded flex items-center hover:bg-gray-100 ${
                            selectedFile?.path === file.path ? 'bg-gray-100 font-medium' : ''
                          }`}
                        >
                          <div className="i-ph:file-code text-lg mr-1 text-[var(--rill-text-secondary)]"></div>
                          <span className="truncate">
                            {file.path.split('/').pop()}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="w-3/4 p-4">
            {selectedFile ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-[var(--rill-text-primary)]">
                    {selectedFile.path}
                  </div>
                </div>
                <div className="border border-[var(--rill-border-color)] rounded-md p-4 overflow-auto max-h-[500px] bg-gray-50">
                  <pre className="text-xs font-mono whitespace-pre-wrap text-[var(--rill-text-primary)]">
                    {selectedFile.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[500px] text-[var(--rill-text-secondary)]">
                Select a file to view its contents
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 