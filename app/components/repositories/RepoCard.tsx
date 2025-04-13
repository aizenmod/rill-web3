import { Link } from '@remix-run/react';
import type { Repository } from './RepoList.client';

interface RepoCardProps {
  repository: Repository;
}

export function RepoCard({ repository }: RepoCardProps) {
  // Format the timestamp to a readable date
  const formattedDate = new Date(repository.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--rill-border-color)] p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <div className="i-ph:code-duotone text-xl text-[var(--rill-primary)]"></div>
            <h3 className="text-xl font-medium text-[var(--rill-primary)]">
              <Link to={`/repositories/${repository.cid}`} className="hover:underline">
                {repository.name || 'Unnamed Project'}
              </Link>
            </h3>
          </div>
          
          {repository.description && (
            <p className="text-[var(--rill-text-secondary)] mt-2">
              {repository.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-4 text-sm text-[var(--rill-text-secondary)]">
            <div className="flex items-center gap-1">
              <div className="i-ph:file-duotone text-lg"></div>
              <span>{repository.fileCount} files</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="i-ph:calendar-duotone text-lg"></div>
              <span>Updated on {formattedDate}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <a 
            href={`https://gateway.lighthouse.storage/ipfs/${repository.cid}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
            title="View on IPFS"
          >
            <div className="i-ph:globe-duotone text-lg"></div>
            <span>IPFS</span>
          </a>
          <Link
            to={`/repositories/${repository.cid}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium bg-[var(--rill-primary)] text-white hover:bg-[var(--rill-primary-dark)] transition-colors"
          >
            <div className="i-ph:eye-duotone text-lg"></div>
            <span>View</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 