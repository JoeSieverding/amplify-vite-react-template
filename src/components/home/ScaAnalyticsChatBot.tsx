// React imports
import { useState } from 'react';

// AWS imports
import { 
  BedrockRuntimeClient,
  ConverseCommand
} from '@aws-sdk/client-bedrock-runtime';
import { fetchAuthSession } from '@aws-amplify/auth';

// Cloudscape Design System imports
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Input, { InputProps } from '@cloudscape-design/components/input';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Textarea from '@cloudscape-design/components/textarea';
import FormField from '@cloudscape-design/components/form-field';
import Alert from '@cloudscape-design/components/alert';

// PDF.js imports
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

// Document processing imports
import mammoth from 'mammoth';

// Define ChatMessage type
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
  }

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

function ScaAnalyticsChatBot(): JSX.Element {
  const [userInput, setUserInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

  const bedrockClient = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: async () => {
      const { credentials } = await fetchAuthSession();
      if (!credentials) {
        throw new Error('No credentials available');
      }
      return credentials;
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 10MB limit');
        event.target.value = '';
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const readPdfFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: TextItem | TextMarkedContent) => {
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const readDocFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const readFileContent = async (file: File): Promise<string> => {
    const fileType = file.name.toLowerCase();
    
    try {
      if (fileType.endsWith('.pdf')) {
        return await readPdfFile(file);
      } else if (fileType.endsWith('.doc') || fileType.endsWith('.docx')) {
        return await readDocFile(file);
      } else {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });
      }
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Failed to read file content');
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!userInput.trim() && !selectedFile) return;

    setIsLoading(true);
    setError('');
    let messageContent = userInput;

    try {
      if (selectedFile) {
        const fileContent = await readFileContent(selectedFile);
        messageContent = `${messageContent}\n\nFile Content:\n${fileContent}`;
      }

      const updatedHistory = `${chatHistory}\nUser: ${userInput}${selectedFile ? ` (with file: ${selectedFile.name})` : ''}`;
      setChatHistory(updatedHistory);

      const newMessage: ChatMessage = {
        role: 'user',
        content: messageContent
      };

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      // Simplified Bedrock converse call
      const response = await bedrockClient.send(new ConverseCommand({
        modelId: 'arn:aws:bedrock:us-east-1:479394258862:prompt/Q5W2KCW9FH',
        messages: [{
          role: 'user',
          content: [{ text: messageContent }]
        }]
      }));

      // Parse the response
      if (response?.output?.message?.content?.[0]?.text) {
        const outputText = response.output.message.content[0].text;
        setChatHistory(prev => `${prev}\nBot: ${outputText}`);
        setMessages(prev => [...prev, { role: 'assistant', content: outputText }]);
      }

    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing your request');
      setChatHistory(`${chatHistory}\nBot: Sorry, I encountered an error processing your request.`);
    } finally {
      setIsLoading(false);
      setUserInput('');
      setSelectedFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleKeyDown: InputProps['onKeyDown'] = (event) => {
    if (event.detail.keyCode === 13 && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <Container>
      <SpaceBetween size="l" direction="vertical">
        {[
          <Header 
            key="analytics-header"
            variant="h1"
          >
            SCA Analytics Bot
          </Header>,
          
          error && (
            <Alert 
              key="analytics-error"
              type="error"
            >
              {error}
            </Alert>
          ),
          
          <Textarea
            key="analytics-chat-history"
            value={chatHistory}
            rows={15}
            readOnly
            placeholder="Chat history will appear here..."
          />,
          
          <div key="analytics-input-section">
            <SpaceBetween size="xs" direction="vertical">
              {[
                <FormField 
                  key="analytics-file-input"
                  label="Upload File (optional)"
                  stretch={true}
                >
                  <div style={{ width: '100%' }}>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".txt,.csv,.json,.yaml,.xml,.md,.pdf,.doc,.docx"
                      disabled={isLoading}
                      style={{ width: '100%' }}
                    />
                  </div>
                </FormField>,
                
                <div key="analytics-input-container" style={{ display: 'flex', width: '100%' }}>
                  <SpaceBetween 
                    size="xs" 
                    direction="horizontal" 
                    alignItems="center"
                  >
                    <div style={{ flex: '1 1 auto' }}>
                      <Input
                        value={userInput}
                        onChange={({ detail }) => setUserInput(detail.value)}
                        placeholder="Type your message here..."
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                      />
                    </div>
                    <Button 
                      variant="primary"
                      onClick={handleSendMessage}
                      loading={isLoading}
                    >
                      Send
                    </Button>
                  </SpaceBetween>
                </div>
              ]}
            </SpaceBetween>
          </div>
        ]}
      </SpaceBetween>
    </Container>
  );
  
  
  
}

export default ScaAnalyticsChatBot;
