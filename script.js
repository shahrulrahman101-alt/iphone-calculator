
const result = document.getElementById("result");
const history = document.getElementById("history");
const decimalResult = document.getElementById("decimalResult");
const sciPanel = document.getElementById("sciPanel");
const angleMode = document.getElementById("angleMode");

let current = "0";
let previous = null;
let operator = null;
let resetNext = false;
let isDegree = true;
let lastAnswer = 0;
let exactValue = null;

function format(n) {
    if (!Number.isFinite(n)) return "Error";
    return String(Number(n.toPrecision(12)));
}

function update() {
    result.textContent = exactValue ?? current;
    decimalResult.textContent =
        exactValue && current !== "Error"
        ? "≈ " + current
        : "";
}

function calculate(a, b, op) {
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0 ? NaN : a / b;
        case "^": return Math.pow(a, b);
    }
}

function inputNumber(n) {
    if (current === "Error" || resetNext) {
        current = n;
        resetNext = false;
    } else if (current.replace("-", "").length < 14) {
        current = current === "0" ? n : current + n;
    }

    exactValue = null;
    update();
}

function chooseOperator(op) {
    if (current === "Error") return;

    exactValue = null;

    if (operator && !resetNext) {
        current = format(
            calculate(Number(previous), Number(current), operator)
        );
    }

    previous = current;
    operator = op;
    resetNext = true;
    history.textContent = `${previous} ${op}`;
    update();
}

function equal() {
    if (!operator || previous === null) return;

    const expression = `${previous} ${operator} ${current}`;
    const answer = calculate(
        Number(previous),
        Number(current),
        operator
    );

    current = format(answer);
    lastAnswer = answer;
    history.textContent = expression + " =";

    previous = null;
    operator = null;
    resetNext = true;
    exactValue = null;
    update();
}

function clear() {
    current = "0";
    previous = null;
    operator = null;
    resetNext = false;
    exactValue = null;
    history.textContent = "";
    decimalResult.textContent = "";
    update();
}

function decimal() {
    if (current === "Error" || resetNext) {
        current = "0.";
        resetNext = false;
    } else if (!current.includes(".")) {
        current += ".";
    }

    exactValue = null;
    update();
}

function sign() {
    if (current !== "0" && current !== "Error") {
        current = current.startsWith("-")
            ? current.slice(1)
            : "-" + current;
    }

    exactValue = null;
    update();
}

function percent() {
    current = current === "Error"
        ? "Error"
        : format(Number(current) / 100);

    exactValue = null;
    resetNext = true;
    update();
}

function backspace() {
    if (resetNext || current === "Error") {
        current = "0";
        resetNext = false;
    } else {
        current = current.length <= 1 ||
            (current.length === 2 && current.startsWith("-"))
            ? "0"
            : current.slice(0, -1);
    }

    exactValue = null;
    update();
}

// Exact values for common angles in degrees
function exactTrig(action, angle) {
    const a = ((angle % 360) + 360) % 360;

    const table = {
        0:   ["0", "1", "0"],
        30:  ["1/2", "√3/2", "1/√3"],
        45:  ["√2/2", "√2/2", "1"],
        60:  ["√3/2", "1/2", "√3"],
        90:  ["1", "0", "undefined"],
        120: ["√3/2", "-1/2", "-√3"],
        135: ["√2/2", "-√2/2", "-1"],
        150: ["1/2", "-√3/2", "-1/√3"],
        180: ["0", "-1", "0"],
        210: ["-1/2", "-√3/2", "1/√3"],
        225: ["-√2/2", "-√2/2", "1"],
        240: ["-√3/2", "-1/2", "√3"],
        270: ["-1", "0", "undefined"],
        300: ["-√3/2", "1/2", "-√3"],
        315: ["-√2/2", "√2/2", "-1"],
        330: ["-1/2", "√3/2", "-1/√3"]
    };

    const key = Math.round(a);
    const values = table[key];

    if (!values || Math.abs(a - key) > 1e-9) return null;

    const index = { sin: 0, cos: 1, tan: 2 }[action];
    return values[index];
}

function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 170) {
        return NaN;
    }

    let answer = 1;

    for (let i = 2; i <= n; i++) {
        answer *= i;
    }

    return answer;
}

function unary(action) {
    if (current === "Error") return;

    const n = Number(current);
    let answer;
    let exact = null;
    const angle = isDegree ? n : n * 180 / Math.PI;

    switch (action) {
        case "sin":
        case "cos":
        case "tan": {
            const radians = isDegree ? n * Math.PI / 180 : n;

            answer = action === "sin"
                ? Math.sin(radians)
                : action === "cos"
                ? Math.cos(radians)
                : Math.tan(radians);

            if (action === "tan" &&
                Math.abs(Math.cos(radians)) < 1e-12) {
                answer = NaN;
            }

            if (isDegree) {
                exact = exactTrig(action, angle);
            }

            break;
        }

        case "sqrt":
            answer = n < 0 ? NaN : Math.sqrt(n);
            break;

        case "square":
            answer = n * n;
            break;

        case "reciprocal":
            answer = n === 0 ? NaN : 1 / n;
            break;

        case "log":
            answer = n > 0 ? Math.log10(n) : NaN;
            break;

        case "ln":
            answer = n > 0 ? Math.log(n) : NaN;
            break;

        case "factorial":
            answer = factorial(n);
            break;

        case "abs":
            answer = Math.abs(n);
            break;
    }

    history.textContent = action + "(" + current + ")";

    current = format(answer);
    lastAnswer = answer;
    exactValue = exact;
    resetNext = true;

    update();
}

function insertConstant(value, label) {
    current = format(value);
    exactValue = null;
    resetNext = true;
    history.textContent = label;
    update();
}

function power() {
    chooseOperator("^");
}

// Scientific button events
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

            case "sin":
            case "cos":
            case "tan":
            case "sqrt":
            case "square":
            case "reciprocal":
            case "log":
            case "ln":
            case "factorial":
            case "abs":
                unary(action);
                break;

            case "power": power(); break;

            case "pi":
                insertConstant(Math.PI, "π");
                break;

            case "e":
                insertConstant(Math.E, "e");
                break;

            case "ans":
                current = format(lastAnswer);
                exactValue = null;
                resetNext = true;
                update();
                break;
        }
    });
});

// Scientific panel
document.getElementById("sciToggle").addEventListener("click", () => {
    sciPanel.hidden = !sciPanel.hidden;
});

// Degree / Radian mode
angleMode.addEventListener("click", () => {
    isDegree = !isDegree;
    angleMode.textContent = isDegree ? "DEG" : "RAD";
});

// Keyboard support
document.addEventListener("keydown", event => {
    const key = event.key;

    if (/^[0-9]$/.test(key)) inputNumber(key);
    else if (key === ".") decimal();
    else if (["+", "-", "*", "/"].includes(key)) chooseOperator(key);
    else if (key === "^") chooseOperator("^");
    else if (key === "Enter" || key === "=") equal();
    else if (key === "Backspace") backspace();
    else if (key === "Escape") clear();
    else if (key === "%") percent();
});
