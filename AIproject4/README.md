# AI Code Assistant

A fully functional IDE-like AI code assistant with dark theme, built using HTML, CSS, and JavaScript. Uses Monaco Editor for code editing and integrates with Claude 3 Haiku for AI-powered code analysis and correction.

## Features

- Dark theme IDE interface
- Syntax highlighting and error highlighting in red
- AI analysis for code errors and improvements
- Automatic code correction suggestions
- Uses Claude 3 Haiku model (via OpenRouter API)

## Setup

1. Clone or download the project files.
2. Open `index.html` in a web browser.
3. The app will automatically use AI analysis via OpenRouter API.

## AI Integration

The app uses the Claude 3 Haiku model via OpenRouter API for real AI analysis and correction. The API key is included in the code for demonstration.

### Features:
- Syntax error detection and highlighting
- AI-powered code analysis and improvement suggestions
- Automatic code correction with explanations

### Usage:
1. Type JavaScript code in the editor
2. Click "Analyze"
3. View highlighted errors and AI suggestions in the output

### API Details:
- Provider: OpenRouter
- Model: anthropic/claude-3-haiku
- Free tier available, but may have rate limits

### For Other APIs

To use cloud APIs like Hugging Face or Together AI, modify `script.js` to use fetch with the appropriate endpoints and API keys. Refer to the research for examples.

## Usage

1. Type or paste JavaScript code in the editor.
2. Click "Analyze" button.
3. View errors highlighted in red in the editor.
4. See analysis and corrected code in the output area.

## Technologies Used

- HTML5
- CSS3 (Dark Theme)
- JavaScript
- Monaco Editor (VS Code editor)
- Acorn (JavaScript parser)
- Ollama (for local AI model)