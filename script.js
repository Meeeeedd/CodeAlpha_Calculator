/**
 * Calculator class to encapsulate all calculation logic and state.
 */
class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.history = JSON.parse(localStorage.getItem('calc-history')) || [];
        this.clear();
        this.updateHistoryDisplay();
    }

    // Resets the calculator to its initial state.
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.displayNeedsReset = false;
    }

    // Removes the last digit from the current operand.
    delete() {
        if (this.currentOperand.length > 1) {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        } else {
            this.currentOperand = '0';
        }
    }

    // Appends a number or a decimal point to the current input.
    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.displayNeedsReset) {
            this.currentOperand = '';
            this.displayNeedsReset = false;
        }
        this.currentOperand = this.currentOperand === '0' && number !== '.'
            ? number.toString()
            : this.currentOperand.toString() + number.toString();
    }

    // Sets the mathematical operation for the calculation.
    chooseOperation(operation) {
        if (this.currentOperand === '' && this.previousOperand === '') return;
        if (this.previousOperand !== '') {
            this.calculate();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    // Performs the calculation and updates the state.
    calculate() {
        let result;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        const expression = `${this.getFormattedNumber(this.previousOperand)} ${this.operation} ${this.getFormattedNumber(this.currentOperand)}`;

        switch (this.operation) {
            case '+': result = prev + current; break;
            case '−': result = prev - current; break;
            case '×': result = prev * current; break;
            case '÷':
                if (current === 0) {
                    this.showError("Can't divide by zero");
                    return;
                }
                result = prev / current;
                break;
            default: return;
        }

        this.currentOperand = result.toString();
        this.addHistory(expression, this.currentOperand);
        this.operation = undefined;
        this.previousOperand = '';
        this.displayNeedsReset = true;
    }

    // Adds a completed calculation to the history array.
    addHistory(expression, result) {
        this.history.unshift({ expression, result }); // Add to the beginning
        if (this.history.length > 20) this.history.pop(); // Limit history size
        localStorage.setItem('calc-history', JSON.stringify(this.history));
        this.updateHistoryDisplay();
    }
    
    // Loads a result from history into the current operand.
    loadFromHistory(result) {
        this.currentOperand = result.toString();
        this.previousOperand = '';
        this.operation = undefined;
        this.displayNeedsReset = true;
        this.updateDisplay();
        historyPanel.classList.remove('open');
    }

    // Updates the visual history panel in the UI.
    updateHistoryDisplay() {
        historyList.innerHTML = '';
        if (this.history.length === 0) {
            historyList.innerHTML = `<li class="history-item-empty">No history yet</li>`;
        } else {
            this.history.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('history-item');
                li.innerHTML = `<span class="expression">${item.expression} =</span><span class="result">${this.getFormattedNumber(item.result)}</span>`;
                li.addEventListener('click', () => this.loadFromHistory(item.result));
                historyList.appendChild(li);
            });
        }
    }

    // Formats numbers with commas for readability.
    getFormattedNumber(numberString) {
        if (!numberString) return '';
        const [integerPart, decimalPart] = numberString.toString().split('.');
        const integerDisplay = isNaN(parseFloat(integerPart)) ? '' :
            parseFloat(integerPart).toLocaleString('en', { maximumFractionDigits: 20 });
        return decimalPart != null ? `${integerDisplay}.${decimalPart}` : integerDisplay;
    }
    
    // Updates the main display with current values.
    updateDisplay() {
        this.currentOperandElement.innerText = this.getFormattedNumber(this.currentOperand);
        this.previousOperandElement.innerText = this.operation
            ? `${this.getFormattedNumber(this.previousOperand)} ${this.operation}`
            : '';
    }

    // Displays an error message temporarily.
    showError(message) {
        this.currentOperandElement.innerText = message;
        this.previousOperandElement.innerText = '';
        setTimeout(() => this.clear(), 2000);
    }
}

// --- DOM Element Selection ---
const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
const allButtons = document.querySelectorAll('.btn, .btn-ai, .header-btn');
const historyBtn = document.getElementById('history-btn');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const themeToggle = document.getElementById('theme-toggle');

// --- Initialization ---
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// --- Theme Management ---
const savedTheme = localStorage.getItem('calculator-theme') || 'light-theme';
document.body.className = savedTheme;
themeToggle.checked = savedTheme === 'dark-theme';

themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark-theme' : 'light-theme';
    document.body.className = newTheme;
    localStorage.setItem('calculator-theme', newTheme);
});

// --- Event Listeners ---
historyBtn.addEventListener('click', () => historyPanel.classList.toggle('open'));

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const { number, operator, action } = button.dataset;
        if (number) calculator.appendNumber(number);
        else if (operator) {
            const opMap = {'divide': '÷', 'multiply': '×', 'subtract': '−', 'add': '+'};
            calculator.chooseOperation(opMap[operator]);
        } 
        else if (action) {
            switch(action) {
                case 'clear': calculator.clear(); break;
                case 'delete': calculator.delete(); break;
                case 'calculate': calculator.calculate(); break;
                case 'percent': /* Placeholder for percent logic if needed */ break;
            }
        }
        calculator.updateDisplay();
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key >= 0 && e.key <= 9 || e.key === '.') calculator.appendNumber(e.key);
    if (e.key === 'Enter' || e.key === '=') calculator.calculate();
    if (e.key === 'Backspace') calculator.delete();
    if (e.key === 'Escape' || e.key.toLowerCase() === 'c') calculator.clear();
    if (e.key === '+') calculator.chooseOperation('+');
    if (e.key === '-') calculator.chooseOperation('−');
    if (e.key === '*') calculator.chooseOperation('×');
    if (e.key === '/') calculator.chooseOperation('÷');
    calculator.updateDisplay();
});


// --- AI Feature Logic ---
const aiFeatureBtn = document.getElementById('ai-feature-btn');
const aiModal = document.getElementById('ai-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const solveProblemBtn = document.getElementById('solve-problem-btn');
const wordProblemInput = document.getElementById('word-problem-input');
const aiResultContainer = document.getElementById('ai-result-container');
const aiExpression = document.getElementById('ai-expression');
const aiAnswer = document.getElementById('ai-answer');
const loadingSpinner = document.getElementById('loading-spinner');

aiFeatureBtn.addEventListener('click', () => aiModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => aiModal.classList.add('hidden'));
aiModal.addEventListener('click', (e) => {
    if (e.target === aiModal) aiModal.classList.add('hidden');
});

solveProblemBtn.addEventListener('click', async () => {
    const problemText = wordProblemInput.value.trim();
    if (problemText === '') {
        wordProblemInput.classList.add('input-error');
        setTimeout(() => wordProblemInput.classList.remove('input-error'), 1500);
        return;
    }

    loadingSpinner.classList.remove('hidden');
    aiResultContainer.classList.add('hidden');
    
    const prompt = `Analyze the following word problem. Provide a structured JSON response with two keys: "expression" (the mathematical expression needed) and "answer" (the final numerical result). Problem: '${problemText}'`;

    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: { "expression": { "type": "STRING" }, "answer": { "type": "STRING" } },
                    required: ["expression", "answer"]
                }
            }
        };

        const apiKey = ""; // Left empty for Canvas environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

        const result = await response.json();
        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText) {
            const parsedJson = JSON.parse(responseText);
            aiExpression.textContent = parsedJson.expression || "Not found";
            aiAnswer.textContent = parsedJson.answer || "Not found";
        } else {
            throw new Error("Invalid API response format.");
        }

    } catch (error) {
        console.error("Gemini API call failed:", error);
        aiExpression.textContent = "Error";
        aiAnswer.textContent = "Could not solve the problem. Please try again.";
    } finally {
        loadingSpinner.classList.add('hidden');
        aiResultContainer.classList.remove('hidden');
    }
});