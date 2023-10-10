#!/usr/bin/env node

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import input from '@inquirer/input';
import select from '@inquirer/select';
import editor from '@inquirer/editor';

const openai = new OpenAI();

const loadTemplatesFromDirectory = (directory) => fs.readdirSync(directory)
  .filter(file => file.endsWith('.txt'))
  .map(filename => ({
    name: path.basename(filename, '.txt'),
    value: fs.readFileSync(path.join(directory, filename), 'utf-8')
  }));

const promptUserForTemplate = async (templates) => select({
  message: 'Select your template:',
  choices: [{ name: 'ChatGPT', value: '' },  ...templates]
});

const promptUserForMessage = async () => {
  let userInput = await input({ message: 'You:' });

  // Provide an editor for multine input
  if (userInput.trim() === '') {
    userInput = await editor({
      message: 'Write your message in the editor:',
      waitForUseInput: false
    });
  }

  return userInput;
}

const generateAIResponse = async (chatMessages) => {
  let content = '';

  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // optionally change to gpt-4
    messages: chatMessages,
    stream: true
  });

  process.stdout.write(`\nAI: `);

  // Stream chunks to console
  for await (const part of stream) {
    const contentPart = part.choices[0]?.delta?.content || '';
    process.stdout.write(contentPart);
    content += contentPart;
  }

  process.stdout.write(`\n\n`);

  return content;
};

// Recursively handle chat sessions
const initiateChatSession = async () => {
  try {
    let chatMessages = [];
    const templates = loadTemplatesFromDirectory('templates');
    const template = await promptUserForTemplate(templates);

    if (template.trim() !== '') {
      chatMessages.push({ "role": "system", "content": template });
    }

    // loop chat until user types 'exit'
    while (true) {
      const userInput = await promptUserForMessage();
      if (userInput.trim() === '') continue;
      if (userInput.trim().toLowerCase() === 'exit') break;

      chatMessages.push({ "role": "user", "content": userInput });
      const assistantResponse = await generateAIResponse(chatMessages);
      chatMessages.push({ "role": "assistant", "content": assistantResponse });
    }

    initiateChatSession(templates);
  } catch { }
};

initiateChatSession();