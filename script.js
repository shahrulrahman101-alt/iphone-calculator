
const result = document.getElementById("result");
const history = document.getElementById("history");
const sciPanel = document.getElementById("sciPanel");

let current = "0";
let previous = null;
let operator = null;
let resetNext = false;

function update() {
    result.textContent = current;
}

function format(n) {
    if (!Number.isFinite(n)) return "Error";
    return String(Number(n.toPrecision(12)));
}

function calculate(a, b, op) {
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0 ? NaN : a / b;
        default: return b;
    }
}

function inputNumber(n) {
    if (current === "Error" || resetNext) {
        current = n;
        resetNext = false;
    } else if (current.replace("-", "").length < 14) {
        current = current === "0" ? n : current + n;
    }
    update();
}

function chooseOperator(op) {
    if (current === "Error") return;

    if (operator && !resetNext) {
        current = format(
            calculate(Number(previous), Number(current), operator)
        );
    }

    previous = current;
    operator = op;
    resetNext = true;
    history.textContent = `${current} ${op}`;
    update();
}

function equal() {
    if (!operator || previous === null) return;

    const expression = `${previous} ${operator} ${current}`;
    current = format(
        calculate(Number(previous), Number(current), operator)
    );

    history.textContent = expression + " =";
    previous = null;
    operator = null;
    resetNext = true;
    update();
}

function clear() {
    current = "0";
    previous = null;
    operator = null;
    resetNext = false;
    history.textContent = "";
    update();
}

function decimal() {
    if (current === "Error" || resetNext) {
        current = "0.";
        resetNext = false;
    } else if (!current.includes(".")) {
        current += ".";
    }
    update();
}

function sign() {
    if (current !== "0" && current !== "Error") {
        current = current.startsWith("-")
            ? current.slice(1)
            : "-" + current;
    }
    update();
}

function percent() {
    if (current !== "Error") {
        current = format(Number(current) / 100);
    }
    update();
}

function backspace() {
    if (current === "Error" || resetNext) {
        current = "0";
        resetNext = false;
    } else {
        current = current.length <= 1 ||
            (current.length === 2 && current.startsWith("-"))
            ? "0"
            : current.slice(0, -1);
    }
    update();
}

function unary(action) {
    const n = Number(current);
    let answer;

    if (current === "Error") return;

    switch (action) {
        case "sqrt":
            answer = n < 0 ? NaN : Math.sqrt(n);
            break;
        case "square":
            answer = n * n;
            break;
        case "reciprocal":
            answer = n === 0 ? NaN : 1 / n;
            break;
        case "sin":
            answer = Math.sin(n * Math.PI / 180);
            break;
        case "cos":
            answer = Math.cos(n * Math.PI / 180);
            break;
        case "tan":
            answer = Math.abs(Math.cos(n * Math.PI / 180)) < 1e-12
                ? NaN
                : Math.tan(n * Math.PI / 180);
            break;
    }

    history.textContent = action + "(" + current + ")";
    current = format(answer);
    resetNext = true;
    update();
}

function pi() {
    current = format(Math.PI);
    resetNext = true;
    history.textContent = "π";
    update();
}

document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
        const n = button.dataset.number;
        const op = button.dataset.op;
        const action = button.dataset.action;

        if (n !== undefined) inputNumber(n);
        if (op) chooseOperator(op);

        switch (action) {
            case "clear": clear(); break;
            case "decimal": decimal(); break;
            case "sign": sign(); break;
            case "percent": percent(); break;
            case "equals": equal(); break;
            case "backspace": backspace(); break;
            case "scientific":
                sciPanel.hidden = !sciPanel.hidden;
                break;
            case "pi": pi(); break;
            case "sqrt":
            case "square":
            case "reciprocal":
            case "sin":
            case "cos":
            case "tan":
                unary(action);
                break;
        }
    });
});

// Keyboard support
document.addEventListener("keydown", event => {
    const key = event.key;

    if (/^[0-9]$/.test(key)) inputNumber(key);
    else if (key === ".") decimal();
    else if (["+", "-", "*", "/"].includes(key)) chooseOperator(key);
    else if (key === "Enter" || key === "=") equal();
    else if (key === "Backspace") backspace();
    else if (key === "Escape") clear();
    else if (key === "%") percent();
});
