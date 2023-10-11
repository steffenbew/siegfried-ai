import { ChatOpenAI } from "langchain/chat_models/openai";
import { SystemMessage, HumanMessage, AIMessage } from "langchain/schema";
import { input, select, editor } from '@inquirer/prompts';
import fs from 'fs';
import path from 'path';

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo", // optionally change to gpt-4
  streaming: true,
  callbacks: [{
    handleLLMStart() {
      process.stdout.write(`\nAI: `);
    },
    // stream chat output to console
    handleLLMNewToken(token) {
      process.stdout.write(token);
    },
    handleLLMEnd() {
      process.stdout.write(`\n\n`);
    }
  }]
});

const loadTemplatesFromDirectory = (directory) => fs.readdirSync(directory)
  .filter(file => file.endsWith('.txt'))
  .map(filename => ({
    name: path.basename(filename, '.txt'),
    value: fs.readFileSync(path.join(directory, filename), 'utf-8')
  }));

const promptUserForTemplate = async (templates) => select({
  message: 'Select your template:',
  choices: templates
});

const promptUserForMessage = async () => {
  let userInput = await input({ message: 'You:' });

  // Provide an editor for multiline input
  if (userInput.trim() === '') {
    userInput = await editor({
      message: 'Write your message in the editor:',
      waitForUseInput: false
    });
  }

  return userInput;
}

// Recursively handle chat sessions
const initiateChatSession = async () => {
  let chatMessages = [];
  const templates = loadTemplatesFromDirectory('templates');
  const template = await promptUserForTemplate([{ name: 'ChatGPT', value: '' },  ...templates]);

  if (template.trim() !== '') {
    chatMessages.push(new SystemMessage(template));
  }

  // loop chat until user types 'exit'
  while (true) {
    const userInput = await promptUserForMessage();
    if (userInput.trim() === '') continue;
    if (userInput.trim().toLowerCase() === 'exit') break;

    chatMessages.push(new HumanMessage(userInput));
    const aiResponse = await model.call(chatMessages);
    chatMessages.push(new AIMessage(aiResponse.content));
  }

  initiateChatSession(templates);
};

initiateChatSession();