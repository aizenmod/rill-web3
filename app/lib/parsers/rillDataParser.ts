import { nanoid } from 'nanoid';
import { StreamingMessageParser } from '~/lib/runtime/message-parser';

/**
 * Custom parser for Rill data format that processes artifact and action tags
 */
export function customRillDataParser(text: string) {
  const messageId = nanoid();
  const parser = new StreamingMessageParser();
  return parser.parse(messageId, text);
} 