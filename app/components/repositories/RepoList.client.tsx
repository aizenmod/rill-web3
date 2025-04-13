import { useEffect, useState } from 'react';
import { RepoCard } from './RepoCard';
import { useRepositoryDb } from '~/lib/repositories/useRepositoryDb';
import { toast } from 'react-toastify';

// Mark as client only
export const clientOnly = true;

export type Repository = {
  id: string;
  cid: string;
  name: string;
  description?: string;
  timestamp: string;
  fileCount: number;
};

export function RepoList() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAllRepositories } = useRepositoryDb();

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setIsLoading(true);
        const repos = await getAllRepositories();
        // Sort by timestamp, newest first
        repos.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRepositories(repos);
      } catch (error) {
        console.error('Failed to load repositories:', error);
        toast.error('Failed to load repositories');
      } finally {
        setIsLoading(false);
      }
    };

    loadRepositories();
  }, [getAllRepositories]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="i-svg-spinners:90-ring-with-bg text-[var(--rill-primary)] text-2xl"></div>
        <span className="ml-2 text-[var(--rill-text-secondary)]">Loading repositories...</span>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-[var(--rill-border-color)]">
        <div className="i-ph:folder-notch-open text-6xl text-[var(--rill-text-secondary)] mx-auto mb-4"></div>
        <h3 className="text-xl font-medium text-[var(--rill-text-primary)]">No repositories yet</h3>
        <p className="text-[var(--rill-text-secondary)] mt-2 mb-6">
          Save your projects to Vault to see them here
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--rill-primary)] text-white rounded-md hover:bg-[var(--rill-primary-dark)] transition-colors"
        >
          <div className="i-ph:plus"></div>
          Start a new project
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repositories.map((repo) => (
        <RepoCard key={repo.id} repository={repo} />
      ))}
    </div>
  );
} 