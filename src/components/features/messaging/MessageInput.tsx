import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  placeholder = 'Type a message...',
  disabled = false,
  maxLength = 5000,
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);

      // Handle typing indicator
      if (onTyping) {
        if (!isTyping && value.length > 0) {
          setIsTyping(true);
          onTyping(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          onTyping(false);
        }, 1000);
      }
    }
  }, [maxLength, onTyping, isTyping]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if ((trimmedMessage || attachments.length > 0) && !disabled) {
      onSendMessage(trimmedMessage, attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);

      // Stop typing
      if (isTyping && onTyping) {
        setIsTyping(false);
        onTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [message, attachments, disabled, onSendMessage, isTyping, onTyping]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      // Basic validation - you can extend this
      const maxSize = 10 * 1024 * 1024; // 10MB
      return file.size <= maxSize;
    });

    setAttachments(prev => [...prev, ...validFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // Max 4 lines
    }
  }, []);

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  const canSend = (message.trim() || attachments.length > 0) && !disabled;

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
            >
              <Paperclip className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 truncate max-w-32">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-3">
        {/* File Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />

          {/* Character Count */}
          {message.length > maxLength * 0.8 && (
            <div className="absolute -top-6 right-0 text-xs text-gray-500">
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 p-3 rounded-lg transition-colors ${
            canSend
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Helper Text */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {attachments.length > 0 && (
          <span>{attachments.length} file{attachments.length !== 1 ? 's' : ''} attached</span>
        )}
      </div>
    </div>
  );
};