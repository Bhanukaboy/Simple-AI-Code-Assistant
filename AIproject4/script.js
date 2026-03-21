// script.js
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });

require(['vs/editor/editor.main'], function() {
    console.log('Monaco loaded successfully');
    var editor = monaco.editor.create(document.getElementById('editor'), {
        value: '// Type your JavaScript code here\nconsole.log("Hello World")',
        language: 'javascript',
        theme: 'vs-dark',
        fontSize: 14,
        minimap: { enabled: false },
        readOnly: false
    });
    console.log('Editor created');
    editor.focus(); // Ensure editor is focused for typing
    console.log('Editor focused');

    document.getElementById('analyze').addEventListener('click', function() {
        var code = editor.getValue();
        console.log('Analyzing code:', code);
        analyzeCode(code, editor);
    });
});

function analyzeCode(code, editor) {
    // First, check for syntax errors with acorn
    let syntaxErrors = [];
    try {
        acorn.parse(code, { ecmaVersion: 2020, allowImportExportEverywhere: true });
    } catch (e) {
        syntaxErrors.push({
            line: e.loc ? e.loc.line : 1,
            message: e.message,
            type: 'syntax'
        });
    }

    // Set syntax error markers
    const syntaxMarkers = syntaxErrors.map(err => ({
        startLineNumber: err.line,
        startColumn: 1,
        endLineNumber: err.line,
        endColumn: 100,
        message: err.message,
        severity: monaco.MarkerSeverity.Error
    }));
    monaco.editor.setModelMarkers(editor.getModel(), 'syntax', syntaxMarkers);

    // Now, get AI analysis
    realAIAnalysis(code).then(aiResponse => {
        // Parse the formatted response
        const errorsSection = aiResponse.split('ERRORS:')[1]?.split('SUGGESTIONS:')[0] || '';
        const suggestions = aiResponse.split('SUGGESTIONS:')[1]?.split('CORRECTED CODE:')[0]?.trim() || '';
        const correctedCode = aiResponse.split('CORRECTED CODE:')[1]?.replace(/```javascript\n?|\n?```/g, '').trim() || code;

        // Parse errors
        const errorLines = errorsSection.split('\n').filter(line => line.trim().startsWith('-'));
        const aiErrors = errorLines.map(line => {
            const match = line.match(/- Line (\d+): (.+)/);
            if (match) {
                return {
                    line: parseInt(match[1]),
                    message: match[2],
                    type: 'logical'
                };
            }
            return null;
        }).filter(Boolean);

        // Set AI error markers
        const aiMarkers = aiErrors.map(err => ({
            startLineNumber: err.line,
            startColumn: 1,
            endLineNumber: err.line,
            endColumn: 100,
            message: err.message,
            severity: monaco.MarkerSeverity.Warning
        }));
        monaco.editor.setModelMarkers(editor.getModel(), 'ai', aiMarkers);

        // Display results
        let output = '';
        if (syntaxErrors.length > 0 || aiErrors.length > 0) {
            output += 'Errors found:\n';
            [...syntaxErrors, ...aiErrors].forEach(err => {
                output += `Line ${err.line}: ${err.message}\n`;
            });
            output += '\n';
        } else {
            output += 'No errors found.\n\n';
        }
        if (suggestions) {
            output += 'Suggestions:\n' + suggestions + '\n\n';
        }
        output += 'Corrected Code:\n' + correctedCode + '\n\n--- Raw AI Response ---\n' + aiResponse;
        document.getElementById('output').textContent = output;
    }).catch(err => {
        document.getElementById('output').textContent = 'Analysis failed: ' + err.message;
    });
}

async function realAIAnalysis(code) {
    const apiKey = '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'; // OpenRouter API key
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'microsoft/wizardlm-2-8x22b', // Free and reliable model for code analysis
            messages: [
                { role: 'system', content: 'You are an expert JavaScript code analyzer. CRITICALLY analyze the code for ANY issues, bugs, improvements, or best practices violations. Even perfect code has room for improvement. ALWAYS provide specific suggestions and a corrected version. Format your response EXACTLY like this (copy the format precisely):\n\nERRORS:\n- Line X: specific error message\n- Line Y: specific error message\n\nSUGGESTIONS:\nDetailed suggestions for improvement\n\nCORRECTED CODE:\n```javascript\nimproved/corrected code here\n```' },
                { role: 'user', content: code }
            ],
            max_tokens: 1500
        })
    });
    if (!response.ok) throw new Error('API request failed: ' + response.status + ' ' + response.statusText);
    const data = await response.json();
    return data.choices[0].message.content;
}

async function realAICorrection(code, errorMsg) {
    const apiKey = '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'; // OpenRouter API key
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'microsoft/wizardlm-2-8x22b',
            messages: [{ role: 'user', content: 'This code has error: ' + errorMsg + '. Correct the code and explain the fix: ' + code }],
            max_tokens: 1000
        })
    });
    if (!response.ok) throw new Error('API request failed: ' + response.status + ' ' + response.statusText);
    const data = await response.json();
    return data.choices[0].message.content;
}

function mockAIAnalysis(code) {
    // Simple mock AI analysis using Qwen-like logic (simulated)
    var suggestions = [];
    if (code.includes('var ')) {
        suggestions.push('Consider using let or const instead of var for better scoping.');
    }
    if (!code.includes('use strict')) {
        suggestions.push('Add "use strict"; at the top for stricter mode.');
    }
    if (code.includes('console.log')) {
        suggestions.push('Code looks good for logging.');
    }
    return 'AI Analysis (Mock using Qwen-style reasoning):\n' + suggestions.join('\n');
}

function mockCorrection(code, error) {
    // Simple corrections based on error
    var corrected = code;
    if (error.message.includes('Unexpected token')) {
        // Try to add missing semicolon or bracket
        corrected = code.replace(/([a-zA-Z0-9])\s*$/gm, '$1;');
    }
    if (error.message.includes('Missing initializer')) {
        corrected = code.replace(/let\s+(\w+)\s*;/g, 'let $1 = undefined;');
    }
    // More corrections can be added
    return corrected;
}

// Note: To integrate real Qwen3 Coder 480B, use an API like Hugging Face or Ollama.
// For example, with Ollama running locally:
// async function realAIAnalysis(code) {
//     const response = await fetch('http://localhost:11434/api/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//             model: 'qwen3', // assuming available
//             messages: [{ role: 'user', content: 'Analyze and correct this code: ' + code }]
//         })
//     });
//     const data = await response.json();
//     return data.message.content;
// }
// Then call realAIAnalysis in analyzeCode.