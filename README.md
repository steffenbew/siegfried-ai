# SiegfriedAI - Your Own ChatGPT Agents

> Create and manage task specific GPT AI agents through text-based prompt templates.

SiegfriedAI is a Node.js script to interact with OpenAI's GPT models from your CLI using prompt-based agents. Simply drop your text files with GPT prompts into the `templates` folder to create your customized chat agents.

![SiegfriedAI example](docs/example.gif) 

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Install

Clone the repository:

```bash
git clone https://github.com/steffenbew/siegfried-ai.git
```

Navigate to the project directory and install dependencies:

```bash
cd siegfried-ai
npm install
```

Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY=your_openai_api_key_here
```

Your API key can be found [here](https://platform.openai.com/account/api-keys).

## Usage

Customize the chat agents in the `templates` directory:

```
templates/
├── Customer Support.txt
├── Developer.txt
├── Final Cut Pro.txt
├── Flynt Component.txt
├── Meeting Notes.txt
├── Titles.txt
```

Run the chat interface:

```bash
npm start
```

Follow the on-screen prompts to select a template and start chatting!

To exit the chat, type `exit`.

Optionally make the script available in any shell, by setting an alias in your `.bashrc` or `.zshrc`:
```bash
alias siegfried='(cd ~/your/path/siegfried-ai/ && npm start)'
```

### Multiline input

To provide multiline input, press enter to submit an empty input. This will open a temporary file in your default editor. Submit the text by saving and closing the file.

The default editor can be changed via an environment variable:
```bash
export EDITOR="code -w"
```

For more information see [Inquiry.js#Editor](https://github.com/SBoudrias/Inquirer.js#user-content-editor).

### Context-aware sessions
The script maintains a temporary history of your chat session, which is sent back to OpenAI with every request. This ensures that the agent remains context-aware throughout the conversation, providing more coherent and relevant responses.

Once you close a chat session, the history is dismissed. Each new session starts with a fresh interaction.

### Create your own agents
Create your own chat agents by adding text files with custom prompts in the `templates` directory. The name of the file becomes the agent name which will be provided in the template selection.

#### Example: Code Documentation Helper
Imagine you create a text file named `Code Documentation Helper.txt` in the `templates` directory. This file could contain a prompt like the following:

```
Extend provided code with comments. Use clear and concise language.
```

When you run the script and select `Code Documentation Helper`, you can paste a code snippet. The agent will then generate comments for your code.

## Maintainers
[Steffen Bewersdorff](https://github.com/steffenbew)

## Contributing
To contribute, please use GitHub Issues and PRs.

## License
MIT © 2023 Steffen Bewersdorff
