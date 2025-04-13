import { useState, useEffect } from 'react';
import { WebContainer } from '@webcontainer/api';
import { webcontainer, webcontainerContext } from './index';

/**
 * Hook to access the WebContainer instance
 * @returns The WebContainer instance
 */
export function useWebContainer() {
  const [container, setContainer] = useState<WebContainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initWebContainer = async () => {
      if (typeof window === 'undefined') {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const instance = await webcontainer;
        if (isMounted) {
          setContainer(instance);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize WebContainer:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize WebContainer'));
          setIsLoading(false);
        }
      }
    };

    initWebContainer();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    webcontainer: container,
    isLoading,
    error,
    isLoaded: webcontainerContext.loaded,
  };
} 