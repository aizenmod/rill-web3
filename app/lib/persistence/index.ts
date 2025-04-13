// Export db functions specifically by name
export { 
  db, 
  openDatabase,
  getAll, 
  setMessages,
  getMessages,
  getMessagesByUrlId,
  getMessagesById,
  deleteById, 
  getNextId,
  getUrlId
} from './db';

// Export the chat history related items
export { chatId, description } from './useChatHistory';

// Export the hooks for chat history
export { useChatHistory } from './useChatHistory';

// Export chat item type
export type { ChatHistoryItem } from './useChatHistory';
