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

    // Deletes the last digit.
    delete() {
        if (this.currentOperand.length > 1) {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        } else {
            this.currentOperand = '0';
        }
    }

    // Appends a number or decimal point.
    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.displayNeedsReset) {
            this.currentOperand = '';
            this.displayNeedsReset = false;
        }
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    // Chooses the mathematical operation.
    chooseOperation(operation) {
        if (this.currentOperand === '' && this.previousOperand === '') return;
        if (this.previousOperand !== '') {
            this.calculate();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    // Performs the calculation.
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
                if (current === 0) { this.showError("Can't divide by zero"); return; }
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

    // Adds a calculation to the history array and local storage.
    addHistory(expression, result) {
        this.history.unshift({ expression, result });
        if (this.history.length > 20) this.history.pop();
        localStorage.setItem('calc-history', JSON.stringify(this.history));
        this.updateHistoryDisplay();
    }
    
    // Loads a result from history.
    loadFromHistory(result) {
        this.currentOperand = result.toString();
        this.previousOperand = '';
        this.operation = undefined;
        this.displayNeedsReset = true;
        this.updateDisplay();
        historyPanel.classList.remove('open');
    }

    // Renders the history panel with staggered animations.
    updateHistoryDisplay() {
        historyList.innerHTML = '';
        if (this.history.length === 0) {
            historyList.innerHTML = `<li class="history-item-empty">No history yet</li>`;
        } else {
            this.history.forEach((item, index) => {
                const li = document.createElement('li');
                li.classList.add('history-item');
                li.style.transitionDelay = `${index * 50}ms`;
                li.innerHTML = `<span class="expression">${item.expression} =</span><span class="result">${this.getFormattedNumber(item.result)}</span>`;
                li.addEventListener('click', () => this.loadFromHistory(item.result));
                historyList.appendChild(li);
            });
        }
    }

    // Formats numbers with commas.
    getFormattedNumber(numberString) {
        if (!numberString) return '';
        const [int, dec] = numberString.toString().split('.');
        return (isNaN(parseFloat(int)) ? '' : parseFloat(int).toLocaleString('en')) + (dec != null ? `.${dec}` : '');
    }
    
    // Updates the main display.
    updateDisplay() {
        this.currentOperandElement.innerText = this.getFormattedNumber(this.currentOperand);
        this.previousOperandElement.innerText = this.operation ? `${this.getFormattedNumber(this.previousOperand)} ${this.operation}` : '';
    }

    // Displays a temporary error message.
    showError(message) {
        const originalText = this.currentOperandElement.innerText;
        this.currentOperandElement.innerText = message;
        setTimeout(() => {
            this.currentOperandElement.innerText = originalText;
            this.clear();
        }, 2000);
    }
}

// --- DOM Element Selection ---
const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
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

// --- Main Event Listeners (Buttons) ---
historyBtn.addEventListener('click', () => historyPanel.classList.toggle('open'));
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const { number, operator, action } = button.dataset;
        if (number) calculator.appendNumber(number);
        else if (operator) calculator.chooseOperation({'divide': '÷', 'multiply': '×', 'subtract': '−', 'add': '+'}[operator]);
        else if (action && typeof calculator[action] === 'function') calculator[action]();
        calculator.updateDisplay();
    });
});

// --- Robust Keyboard Support ---
document.addEventListener('keydown', (event) => {
    // Ignore keyboard input if user is typing in the AI modal
    if (document.activeElement.tagName === 'TEXTAREA') return;

    let actionTaken = true; // Flag to check if a calculator action occurred

    if (event.key >= '0' && event.key <= '9' || event.key === '.') {
        calculator.appendNumber(event.key);
    } else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault(); // Prevent default form submission
        calculator.calculate();
    } else if (event.key === 'Backspace') {
        calculator.delete();
    } else if (event.key === 'Escape' || event.key.toLowerCase() === 'c') {
        calculator.clear();
    } else if (event.key === '+') {
        calculator.chooseOperation('+');
    } else if (event.key === '-') {
        calculator.chooseOperation('−');
    } else if (event.key === '*') {
        calculator.chooseOperation('×');
    } else if (event.key === '/') {
        event.preventDefault(); // Prevent find-in-page
        calculator.chooseOperation('÷');
    } else {
        actionTaken = false; // No relevant key was pressed
    }

    if (actionTaken) {
        calculator.updateDisplay();
    }
});


// --- AI Feature & Modal Logic ---
const aiFeatureBtn = document.getElementById('ai-feature-btn');
const aiModal = document.getElementById('ai-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const solveProblemBtn = document.getElementById('solve-problem-btn');
const wordProblemInput = document.getElementById('word-problem-input');
const aiResultContainer = document.getElementById('ai-result-container');
const aiExpression = document.getElementById('ai-expression');
const aiAnswer = document.getElementById('ai-answer');

// Focus Management: Open Modal
aiFeatureBtn.addEventListener('click', () => {
    aiModal.classList.remove('hidden');
    wordProblemInput.focus(); // Set focus on the textarea
});

// Focus Management: Close Modal
const closeModal = () => {
    aiModal.classList.add('hidden');
    aiFeatureBtn.focus(); // Return focus to the button that opened it
};
closeModalBtn.addEventListener('click', closeModal);
aiModal.addEventListener('click', (e) => {
    if (e.target === aiModal) closeModal();
});

solveProblemBtn.addEventListener('click', async () => {
    if (wordProblemInput.value.trim() === '') {
        wordProblemInput.classList.add('input-error');
        setTimeout(() => wordProblemInput.classList.remove('input-error'), 1500);
        return;
    }

    solveProblemBtn.classList.add('loading');
    solveProblemBtn.disabled = true;
    aiResultContainer.classList.add('hidden');
    
    const prompt = `Analyze: "${wordProblemInput.value}". Respond in JSON with "expression" and "answer" keys.`;

    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: { type: "OBJECT", properties: { "expression": { "type": "STRING" }, "answer": { "type": "STRING" } }, required: ["expression", "answer"] }
            }
        };
        const apiKey = ""; // Left empty for Canvas environment
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const result = await response.json();
        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) throw new Error("Invalid API response format.");
        const { expression, answer } = JSON.parse(responseText);
        aiExpression.textContent = expression || "Not found";
        aiAnswer.textContent = answer || "Not found";
    } catch (error) {
        console.error("Gemini API call failed:", error);
        aiExpression.textContent = "Error";
        aiAnswer.textContent = "Could not solve the problem.";
    } finally {
        solveProblemBtn.classList.remove('loading');
        solveProblemBtn.disabled = false;
        aiResultContainer.classList.remove('hidden');
    }
});