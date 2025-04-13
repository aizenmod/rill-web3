import type { MapStore } from 'nanostores';
import type { ArtifactState } from '~/lib/stores/workbench';

/**
 * Extracts artifact data from the workbench store
 */
export function getArtifactsMap(artifacts: MapStore<Record<string, ArtifactState>>) {
  const artifactsMap: Record<string, { id: string; title: string }> = {};
  
  const values = artifacts.get();
  
  for (const [messageId, artifact] of Object.entries(values)) {
    if (!artifact.closed) {
      artifactsMap[messageId] = {
        id: artifact.id,
        title: artifact.title
      };
    }
  }
  
  return artifactsMap;
} 