import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Input, { InputProps } from '@cloudscape-design/components/input';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Textarea from '@cloudscape-design/components/textarea';
import FormField from '@cloudscape-design/components/form-field';
import Alert from '@cloudscape-design/components/alert';
import { useState, useEffect } from 'react';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { fetchAuthSession } from 'aws-amplify/auth';
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';
import mammoth from 'mammoth';

function ScaImportChatBot(): JSX.Element {
  const [userInput, setUserInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  // Initialize PDF.js worker
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }, []);
  

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
        // For other text-based files
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

      const prompt = {
        prompt: `\n\nHuman: ${messageContent}\n\nAssistant:`,
        max_tokens_to_sample: 300,
        temperature: 0.7,
        top_p: 1,
      };

      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-v2',
        body: JSON.stringify(prompt),
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await bedrockClient.send(command);
      const responseBody = new TextDecoder().decode(response.body);
      const parsedResponse = JSON.parse(responseBody);
      const botResponse = parsedResponse.completion || "Sorry, I couldn't generate a response.";

      setChatHistory(`${updatedHistory}\nBot: ${botResponse}`);
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
            key="header"
            variant="h1"
          >
            SCA Import Bot
          </Header>,
          
          error && (
            <Alert 
              key="error"
              type="error"
            >
              {error}
            </Alert>
          ),
          
          <Textarea
            key="chat-history"
            value={chatHistory}
            rows={15}
            readOnly
            placeholder="Chat history will appear here..."
          />,
          
          <SpaceBetween key="input-section" size="xs" direction="vertical">
            {[
              <FormField 
                key="file-input"
                label="Upload File (optional)"
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".txt,.csv,.json,.yaml,.xml,.md,.pdf,.doc,.docx"
                  disabled={isLoading}
                />
              </FormField>,
              
              <SpaceBetween 
                key="message-input"
                size="xs" 
                direction="horizontal" 
                alignItems="center"
              >
                {[
                  <Input
                    key="text-input"
                    value={userInput}
                    onChange={({ detail }) => setUserInput(detail.value)}
                    placeholder="Type your message here..."
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />,
                  <Button 
                    key="send-button"
                    variant="primary"
                    onClick={handleSendMessage}
                    loading={isLoading}
                  >
                    Send
                  </Button>
                ]}
              </SpaceBetween>
            ]}
          </SpaceBetween>
        ].filter(Boolean)}
      </SpaceBetween>
    </Container>
  );
}

export default ScaImportChatBot;
