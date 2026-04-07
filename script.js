/**
 * PROFESSIONAL CALCULATOR LOGIC
 * Focus: DOM Manipulation & Event Delegation
 * 
 * --- THE FLOW ---
 * 1. User Click: The user clicks anywhere inside the `#keypad` container.
 * 2. JS Logic (Event Delegation): Instead of attaching an individual event listener to all 19 buttons, 
 *    we attach exactly ONE listener to the parent `#keypad`. When a click happens inside `#keypad`, 
 *    the event "bubbles up" to our listener. We then inspect `e.target` to see exactly 
 *    which element triggered the click.
 * 3. DOM Update: We process the mathematical logic in JavaScript memory (variables), and finally
 *    we physically update the display element on the screen using `.textContent`.
 */

// 1. DOM Querying
// We use document.querySelector to grab references to the HTML elements we need.
// This is the bridge between JavaScript logic and the actual browser Document Object Model (DOM).
const displayElement = document.querySelector('#display');
const keypadContainer = document.querySelector('#keypad');

// State variables defining what the calculator "remembers"
let currentOperand = '0';
let previousOperand = '';
let currentOperator = null;
let shouldResetDisplay = false;

// 2. Event Delegation
// We attach a SINGLE 'click' event listener to the parent container.
// Why we use `e.target`: 
// `e.target` refers to the exact innermost HTML element that was physically clicked by the mouse/touch.
// Even though our listener is waiting on the parent container, `e.target` will be the specific button!
// This approach is much more memory efficient to modern web application standards.
keypadContainer.addEventListener('click', function(e) {
    const clickedElement = e.target;

    // Safety check: if the clicked element is not a button, stop execution immediately.
    // This prevents errors if the user misclicks the gap between grid buttons.
    if (!clickedElement.matches('button')) {
        return;
    }

    // Determine the action group of the button clicked based on its CSS classes
    // We utilize HTML `data-*` attributes to retrieve the button's specific value/action
    if (clickedElement.classList.contains('number')) {
        handleNumber(clickedElement.dataset.value);
    } 
    else if (clickedElement.classList.contains('operator')) {
        handleOperator(clickedElement.dataset.action);
    } 
    else if (clickedElement.classList.contains('action')) {
        handleAction(clickedElement.dataset.action);
    } 
    else if (clickedElement.classList.contains('calculate')) {
        calculate();
    }

    // 3. DOM Update
    // After our JS logic has evaluated and updated the state variables, 
    // we flush those calculation changes to the HTML DOM so the user sees the result.
    updateDisplay();
});

// LOGIC HELPERS
function handleNumber(number) {
    // Start fresh if calculated recently, or replace '0' outright
    if (currentOperand === '0' || shouldResetDisplay) {
        currentOperand = number;
        shouldResetDisplay = false;
    } else {
        // Prevent multiple decimals in a single number
        if (number === '.' && currentOperand.includes('.')) return;
        currentOperand += number;
    }
}

function handleOperator(operator) {
    if (currentOperator !== null) {
        // Evaluate anything already chained before swapping operators
        calculate();
    }
    previousOperand = currentOperand;
    currentOperator = operator;
    shouldResetDisplay = true; // Signals that next number hit clears current display buffer
}

function handleAction(action) {
    switch (action) {
        case 'clear':
            // AC: Clear memory and display
            currentOperand = '0';
            previousOperand = '';
            currentOperator = null;
            break;
        case 'delete':
            // DEL: Remove last typed character
            if (currentOperand.length === 1 || shouldResetDisplay || currentOperand === 'Error') {
                currentOperand = '0';
            } else {
                currentOperand = currentOperand.slice(0, -1);
            }
            break;
        case 'percentage':
            // %: Base 100 fraction conversion
            currentOperand = (parseFloat(currentOperand) / 100).toString();
            break;
    }
}

function calculate() {
    if (currentOperator === null || shouldResetDisplay) return;

    let result;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);

    // Stop execution if operands are not parseable
    if (isNaN(prev) || isNaN(current)) return;

    switch (currentOperator) {
        case 'add':
            result = prev + current;
            break;
        case 'subtract':
            result = prev - current;
            break;
        case 'multiply':
            result = prev * current;
            break;
        case 'divide':
            if (current === 0) {
                result = 'Error';
            } else {
                result = prev / current;
            }
            break;
        default:
            return;
    }

    // Floating-point correction to avoid ugly numbers (e.g. 0.1 + 0.2 = 0.30000000000000004)
    currentOperand = typeof result === 'number' ? Math.round(result * 1e10) / 1e10 : result;
    currentOperand = currentOperand.toString();
    currentOperator = null;
}

// 3. ACTUAL DOM ATTACHMENT
function updateDisplay() {
    // We use the requested 'textContent' property because our display is a standard semantic <div>.
    // textContent replaces the content seamlessly, without interpreting HTML inside.
    displayElement.textContent = currentOperand;
}
