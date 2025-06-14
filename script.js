// --- Constants for Local Storage & Languages ---
const THEME_STORAGE_KEY = 'calculator-theme';
const LANG_STORAGE_KEY = 'calculator-language';
const HISTORY_STORAGE_KEY = 'calc-history';

// --- Translation Object ---
const translations = {
    en: {
        themeToggleLabel: 'Toggle light and dark theme',
        historyToggleLabel: 'Toggle calculation history',
        deleteBtnLabel: 'Delete',
        clear: 'AC',
        aiSolverBtn: '✨ AI Word Problem Solver',
        aiModalTitle: 'AI Word Problem Solver',
        aiModalDescription: 'Type a math problem and let the AI find the solution.',
        aiPlaceholder: 'e.g., A shirt costs $25 with a 20% discount. What is the final price?',
        solveBtn: '✨ Solve Problem',
        solution: 'Solution',
        expression: 'Expression',
        answer: 'Answer',
        closeModalLabel: 'Close modal',
        historyEmpty: 'No history yet',
        errorDivideByZero: "Can't divide by zero",
        errorApi: 'Could not solve the problem.'
    },
    fr: {
        themeToggleLabel: 'Changer le thème clair/sombre',
        historyToggleLabel: "Afficher l'historique des calculs",
        deleteBtnLabel: 'Supprimer',
        clear: 'AC',
        aiSolverBtn: '✨ Résolveur IA de problèmes',
        aiModalTitle: 'Résolveur IA de problèmes',
        aiModalDescription: 'Écrivez un problème mathématique et laissez l\'IA le résoudre.',
        aiPlaceholder: 'Ex: Une chemise coûte 25€ avec 20% de réduction. Quel est le prix final ?',
        solveBtn: '✨ Résoudre le problème',
        solution: 'Solution',
        expression: 'Expression',
        answer: 'Réponse',
        closeModalLabel: 'Fermer la fenêtre',
        historyEmpty: 'Aucun historique',
        errorDivideByZero: 'Division par zéro impossible',
        errorApi: 'Impossible de résoudre le problème.'
    },
    es: {
        themeToggleLabel: 'Alternar tema claro y oscuro',
        historyToggleLabel: 'Alternar historial de cálculos',
        deleteBtnLabel: 'Borrar',
        clear: 'AC',
        aiSolverBtn: '✨ Solucionador IA de problemas',
        aiModalTitle: 'Solucionador IA de problemas',
        aiModalDescription: 'Escribe un problema matemático y deja que la IA lo resuelva.',
        aiPlaceholder: 'Ej: Una camisa cuesta $25 con un 20% de descuento. ¿Cuál es el precio final?',
        solveBtn: '✨ Resolver problema',
        solution: 'Solución',
        expression: 'Expresión',
        answer: 'Respuesta',
        closeModalLabel: 'Cerrar modal',
        historyEmpty: 'No hay historial',
        errorDivideByZero: 'No se puede dividir por cero',
        errorApi: 'No se pudo resolver el problema.'
    }
};

let currentLanguage = localStorage.getItem(LANG_STORAGE_KEY) || 'en';

/**
 * Applies translations to all elements with data-key attributes.
 * @param {string} lang - The language code (e.g., 'en', 'fr').
 */
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang][key]) el.innerText = translations[lang][key];
    });
    document.querySelectorAll('[data-key-placeholder]').forEach(el => {
        const key = el.getAttribute('data-key-placeholder');
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });
    document.querySelectorAll('[data-key-aria]').forEach(el => {
        const key = el.getAttribute('data-key-aria');
        if (translations[lang][key]) el.setAttribute('aria-label', translations[lang][key]);
    });
    calculator.updateHistoryDisplay();
}

/**
 * Calculator class to encapsulate all calculation logic and state.
 */
class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
        this.clear();
        this.updateHistoryDisplay();
    }

    clear() { this.currentOperand = '0'; this.previousOperand = ''; this.operation = undefined; this.displayNeedsReset = false; }
    delete() { this.currentOperand = this.currentOperand.length > 1 ? this.currentOperand.slice(0, -1) : '0'; }
    
    // ** THE PERCENTAGE FIX IS HERE **
    handlePercent() {
        if (this.currentOperand === '0' || this.currentOperand === '') return;
        this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
    }
    
    appendNumber(number) { if (number === '.' && this.currentOperand.includes('.')) return; if (this.displayNeedsReset) this.currentOperand = ''; this.displayNeedsReset = false; this.currentOperand = this.currentOperand === '0' && number !== '.' ? number : this.currentOperand + number; }
    chooseOperation(operation) { if (this.currentOperand === '' && this.previousOperand === '') return; if (this.previousOperand !== '') this.calculate(); this.operation = operation; this.previousOperand = this.currentOperand; this.currentOperand = ''; }
    
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
                if (current === 0) { this.showError(translations[currentLanguage].errorDivideByZero); return; }
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

    addHistory(expression, result) { this.history.unshift({ expression, result }); if (this.history.length > 20) this.history.pop(); localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.history)); this.updateHistoryDisplay(); }
    loadFromHistory(result) { this.currentOperand = result.toString(); this.previousOperand = ''; this.operation = undefined; this.displayNeedsReset = true; this.updateDisplay(); historyPanel.classList.remove('open'); }
    
    updateHistoryDisplay() {
        historyList.innerHTML = '';
        if (this.history.length === 0) {
            historyList.innerHTML = `<li class="history-item-empty">${translations[currentLanguage].historyEmpty}</li>`;
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

    getFormattedNumber(numberString) {
        if (!numberString) return '';
        const locale = currentLanguage === 'fr' ? 'fr-FR' : currentLanguage === 'es' ? 'es-ES' : 'en-US';
        const [int, dec] = numberString.toString().split('.');
        return (isNaN(parseFloat(int)) ? '' : parseFloat(int).toLocaleString(locale)) + (dec != null ? `.${dec}` : '');
    }
    
    updateDisplay() { this.currentOperandElement.innerText = this.getFormattedNumber(this.currentOperand); this.previousOperandElement.innerText = this.operation ? `${this.getFormattedNumber(this.previousOperand)} ${this.operation}` : ''; }
    showError(message) { const originalText = this.currentOperandElement.innerText; this.currentOperandElement.innerText = message; setTimeout(() => { this.currentOperandElement.innerText = originalText; this.clear(); this.updateDisplay(); }, 2000); }
}

// --- DOM Element Selection ---
const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
const historyBtn = document.getElementById('history-btn');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const themeToggle = document.getElementById('theme-toggle');
const langBtn = document.getElementById('lang-btn');
const langDropdown = document.getElementById('lang-dropdown');

// --- Initialization ---
const calculator = new Calculator(previousOperandElement, currentOperandElement);
setLanguage(currentLanguage);

// --- Theme Management ---
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light-theme';
document.body.className = savedTheme;
themeToggle.checked = savedTheme === 'dark-theme';
themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark-theme' : 'light-theme';
    document.body.className = newTheme;
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
});

// --- Language Switcher Logic ---
langBtn.addEventListener('click', (e) => { e.stopPropagation(); langDropdown.classList.toggle('open'); });
langDropdown.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        setLanguage(e.target.getAttribute('data-lang'));
        langDropdown.classList.remove('open');
    }
});
document.addEventListener('click', () => langDropdown.classList.remove('open'));

// --- Event Listeners (Buttons & Keyboard) ---
historyBtn.addEventListener('click', () => historyPanel.classList.toggle('open'));
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const { number, operator, action } = button.dataset;
        if (number) calculator.appendNumber(number);
        else if (operator) calculator.chooseOperation({'divide': '÷', 'multiply': '×', 'subtract': '−', 'add': '+'}[operator]);
        // ** THE PERCENTAGE FIX IS HERE **
        else if (action) {
            switch(action) {
                case 'clear': calculator.clear(); break;
                case 'delete': calculator.delete(); break;
                case 'calculate': calculator.calculate(); break;
                case 'percent': calculator.handlePercent(); break;
            }
        }
        calculator.updateDisplay();
    });
});
document.addEventListener('keydown', (event) => {
    if (document.activeElement.tagName === 'TEXTAREA') return;
    let actionTaken = true;
    if (event.key >= '0' && event.key <= '9' || event.key === '.') calculator.appendNumber(event.key);
    else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); calculator.calculate(); }
    else if (event.key === 'Backspace') calculator.delete();
    else if (event.key === 'Escape' || event.key.toLowerCase() === 'c') calculator.clear();
    else if (event.key === '%') calculator.handlePercent();
    else if (event.key === '+') calculator.chooseOperation('+');
    else if (event.key === '-') calculator.chooseOperation('−');
    else if (event.key === '*') calculator.chooseOperation('×');
    else if (event.key === '/') { event.preventDefault(); calculator.chooseOperation('÷'); }
    else actionTaken = false;
    if (actionTaken) calculator.updateDisplay();
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

aiFeatureBtn.addEventListener('click', () => { aiModal.classList.remove('hidden'); wordProblemInput.focus(); });
const closeModal = () => { aiModal.classList.add('hidden'); aiFeatureBtn.focus(); };
closeModalBtn.addEventListener('click', closeModal);
aiModal.addEventListener('click', (e) => { if (e.target === aiModal) closeModal(); });

solveProblemBtn.addEventListener('click', async () => {
    if (wordProblemInput.value.trim() === '') {
        wordProblemInput.classList.add('input-error');
        setTimeout(() => wordProblemInput.classList.remove('input-error'), 1500);
        return;
    }
    solveProblemBtn.classList.add('loading');
    solveProblemBtn.disabled = true;
    aiResultContainer.classList.add('hidden');
    
    const prompt = `Analyze: "${wordProblemInput.value}". The user's language is ${currentLanguage}. Respond in JSON with "expression" and "answer" keys.`;
    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: { type: "OBJECT", properties: { "expression": { "type": "STRING" }, "answer": { "type": "STRING" } }, required: ["expression", "answer"] }
            }
        };
        const apiKey = "";
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
        aiAnswer.textContent = translations[currentLanguage].errorApi;
    } finally {
        solveProblemBtn.classList.remove('loading');
        solveProblemBtn.disabled = false;
        aiResultContainer.classList.remove('hidden');
    }
});