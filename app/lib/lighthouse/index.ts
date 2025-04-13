import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('LighthouseStorage');

/**
 * Interface for Lighthouse SDK
 */
export interface LighthouseSDK {
  upload: (file: File, apiKey: string, progressCallback?: (progress: number) => void) => Promise<any>;
  uploadText: (text: string, apiKey: string, name?: string) => Promise<any>;
  uploadBuffer?: (buffer: Buffer, apiKey: string, name?: string) => Promise<any>;
  getUploads?: (apiKey: string) => Promise<any>;
  deploy?: (text: string, apiKey: string) => Promise<any>;
  getApiKey?: (apiKey: string) => Promise<any>;
  getBalance?: (publicKey: string) => Promise<any>;
  [key: string]: any; // Allow any other properties to handle evolving API
}

let lighthouseSDK: LighthouseSDK | null = null;

/**
 * Initialize the Lighthouse SDK
 */
export async function init(apiKey: string): Promise<void> {
  try {
    // Dynamically import lighthouse SDK in browser environment
    if (typeof window !== 'undefined') {
      const lighthouse = await import('@lighthouse-web3/sdk');
      lighthouseSDK = lighthouse.default;
      logger.info('Lighthouse SDK initialized');
    }
  } catch (error) {
    logger.error('Failed to initialize Lighthouse SDK', error);
    throw error;
  }
}

/**
 * Get the Lighthouse SDK instance
 */
export function getSDK(): LighthouseSDK | null {
  return lighthouseSDK;
}

/**
 * Upload text to Lighthouse
 */
export async function uploadText(text: string, apiKey: string, name?: string): Promise<any> {
  if (!lighthouseSDK) {
    throw new Error('Lighthouse SDK not initialized');
  }
  
  try {
    logger.info('Uploading text to Lighthouse');
    const response = await lighthouseSDK.uploadText(text, apiKey, name);
    logger.info('Text uploaded successfully', response);
    return response;
  } catch (error) {
    logger.error('Failed to upload text to Lighthouse', error);
    throw error;
  }
}

/**
 * Upload file to Lighthouse
 */
export async function uploadFile(file: File, apiKey: string, progressCallback?: (progress: number) => void): Promise<any> {
  if (!lighthouseSDK) {
    throw new Error('Lighthouse SDK not initialized');
  }
  
  try {
    logger.info('Uploading file to Lighthouse');
    const response = await lighthouseSDK.upload(file, apiKey, progressCallback);
    logger.info('File uploaded successfully', response);
    return response;
  } catch (error) {
    logger.error('Failed to upload file to Lighthouse', error);
    throw error;
  }
}

/**
 * Store chat history to Lighthouse
 */
export async function storeChat(chat: any, apiKey: string): Promise<any> {
  if (!lighthouseSDK) {
    throw new Error('Lighthouse SDK not initialized');
  }
  
  try {
    logger.info('Storing chat history to Lighthouse');
    const chatString = JSON.stringify(chat);
    const response = await lighthouseSDK.uploadText(chatString, apiKey, 'chat-history');
    logger.info('Chat history stored successfully', response);
    return response;
  } catch (error) {
    logger.error('Failed to store chat history to Lighthouse', error);
    throw error;
  }
}

/**
 * Store code snapshot to Lighthouse
 */
export async function storeCodeSnapshot(snapshot: any, apiKey: string): Promise<any> {
  if (!lighthouseSDK) {
    throw new Error('Lighthouse SDK not initialized');
  }
  
  try {
    logger.info('Storing code snapshot to Lighthouse');
    const snapshotString = JSON.stringify(snapshot);
    const response = await lighthouseSDK.uploadText(snapshotString, apiKey, 'code-snapshot');
    logger.info('Code snapshot stored successfully', response);
    return response;
  } catch (error) {
    logger.error('Failed to store code snapshot to Lighthouse', error);
    throw error;
  }
}

/**
 * Get uploads from Lighthouse
 */
export async function getUploads(apiKey: string): Promise<any> {
  if (!lighthouseSDK || !lighthouseSDK.getUploads) {
    throw new Error('Lighthouse SDK get uploads not available');
  }
  
  try {
    logger.info('Getting uploads from Lighthouse');
    const response = await lighthouseSDK.getUploads(apiKey);
    logger.info('Uploads retrieved successfully');
    return response;
  } catch (error) {
    logger.error('Failed to get uploads from Lighthouse', error);
    throw error;
  }
}
