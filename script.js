
const result = document.getElementById("result");
const history = document.getElementById("history");

let current = "0";
let previous = null;
let operator = null;
let resetNext = false;

function update() {
    result.textContent = current;
}

function calculate(a, b, op) {
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0 ? "Error" : a / b;
    }
}

function format(number) {
    if (!Number.isFinite(number)) return "Error";
    return String(Number(number.toPrecision(12)));
}

function inputNumber(num) {
    if (current === "Error" || resetNext) {
        current = num;
        resetNext = false;
    } else if (current.replace("-", "").length < 12) {
        current = current === "0" ? num : current + num;
    }
    update();
}

function chooseOperator(op) {
    if (current === "Error") return;

    if (operator && !resetNext) {
        const answer = calculate(
            Number(previous),
            Number(current),
            operator
        );

        current = format(answer);
        update();
    }

    previous = current;
    operator = op;
    resetNext = true;
    history.textContent = current + " " + op;
}

function equal() {
    if (!operator || previous === null) return;

    const a = Number(previous);
    const b = Number(current);
    const answer = calculate(a, b, operator);

    history.textContent = `${previous} ${operator} ${current} =`;
    current = format(answer);

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

document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
        if (button.dataset.number !== undefined) {
            inputNumber(button.dataset.number);
        }

        if (button.dataset.op) {
            chooseOperator(button.dataset.op);
        }

        switch (button.dataset.action) {
            case "clear": clear(); break;
            case "decimal": decimal(); break;
            case "sign": sign(); break;
            case "percent": percent(); break;
            case "equals": equal(); break;
        }
    });
});
