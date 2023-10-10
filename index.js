#!/usr/bin/env node

import OpenAI from 'openai';
import inquirer from 'inquirer';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Initialize OpenAI Chat model
const openai = new OpenAI();

// Store chat message history
let chatMessages = [];

// Load chat templates from the 'templates' directory
const loadTemplates = () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const templateDir = path.join(__dirname, 'templates');
  const filenames = fs.readdirSync(templateDir).filter(file => file.endsWith('.txt'));
  const templates = {};

  filenames.forEach((filename) => {
    const name = path.basename(filename, ".txt");
    const content = fs.readFileSync(path.join(templateDir, filename), "utf-8");
    templates[name] = content;
  });

  return templates;
};

// Ask user to select a template option
const selectTemplate = async (templates) => {
  const choices = ['ChatGPT', ...Object.keys(await templates)];
  const { selectedTemplate } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedTemplate',
      message: 'Select your template:',
      choices
    }
  ]);

  if (selectedTemplate !== 'ChatGPT') {
    chatMessages.push({ "role": "system", "content": (await templates)[selectedTemplate]});
  }
};

// Looping function to handle the chat input
const chatLoop = async () => {
  while (true) {
    const { userInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'userInput',
        message: 'You:'
      }
    ]);

    if (userInput.trim().toLowerCase() === 'exit') {
      break;
    }

    // Provide an editor for multine input
    if (userInput.trim() === '') {
      const { editedContent } = await inquirer.prompt([
        {
          type: 'editor',
          name: 'editedContent',
          message: 'Write your message in the editor:'
        }
      ]);

      if (editedContent.trim() !== '') {
        await processInput(editedContent);
      }
      continue;
    }

    await processInput(userInput);
  }
};

// Call the OpenAI Chat model with user input and chat history
const processInput = async (input) => {
  chatMessages.push({ "role": "user", "content": input });

  let content = '';

  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // optionally change to gpt-4
    messages: chatMessages,
    stream: true
  });

  process.stdout.write(`\nAI: `);

  // Stream chunks to console
  for await (const part of stream) {
    const contentPart = part.choices[0]?.delta?.content || '';
    process.stdout.write(contentPart);
    content += contentPart;
  }

  process.stdout.write(`\n\n`);

  chatMessages.push({ "role": "assistant", "content": content });
};

// Main entry point
(async () => {
  const templates = loadTemplates();
  await selectTemplate(templates);
  await chatLoop();
})();
