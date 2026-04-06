const presets = [10, 15, 20, 25, 30, 35, 40, 45];

// ---------------- Tabs ----------------
const tabDiscount = document.getElementById("tab-discount");
const tabBetween = document.getElementById("tab-between");
const panelDiscount = document.getElementById("panel-discount");
const panelBetween = document.getElementById("panel-between");

// ---------------- Discount tab ----------------
const amountEl = document.getElementById("amount");
const customPctEl = document.getElementById("customPct");
const buttonsEl = document.getElementById("buttons");
const resultEl = document.getElementById("result");
const statusEl = document.getElementById("status");
const copyBtn = document.getElementById("copyBtn");

let selectedPreset = null;
let lastDiscountText = "";

// ---------------- Find % tab ----------------
const partEl = document.getElementById("part");
const totalEl = document.getElementById("total");
const betweenResultEl = document.getElementById("betweenResult");
const betweenStatusEl = document.getElementById("betweenStatus");

// ---------------- Helpers ----------------
function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = `Copied ✅ (${text})`;
    statusEl.classList.add("ok");
  } catch {
    statusEl.textContent = "Clipboard copy failed.";
    statusEl.classList.remove("ok");
  }
}

// ---------------- Tabs logic ----------------
function setTab(tab) {
  const isDiscount = tab === "discount";

  tabDiscount.classList.toggle("active", isDiscount);
  tabBetween.classList.toggle("active", !isDiscount);

  panelDiscount.classList.toggle("active", isDiscount);
  panelBetween.classList.toggle("active", !isDiscount);

  (isDiscount ? amountEl : partEl).focus();
}

tabDiscount.onclick = () => setTab("discount");
tabBetween.onclick = () => setTab("between");

// ---------------- Discount logic ----------------
function getPercent() {
  const custom = toNumber(customPctEl.value);
  if (custom !== null && customPctEl.value !== "") return custom;
  return selectedPreset;
}

function calcDiscount() {
  const amount = toNumber(amountEl.value);
  const pct = getPercent();

  if (amount === null || pct === null) {
    resultEl.textContent = "—";
    statusEl.textContent = "Enter an amount and pick a %.";
    statusEl.classList.remove("ok");
    lastDiscountText = "";
    return null;
  }

  const discounted = amount * (1 - pct / 100);
  const text = discounted.toFixed(2);

  resultEl.textContent = text;
  lastDiscountText = text;
  return text;
}

function calcAndAutoCopyDiscount() {
  const text = calcDiscount();
  if (text !== null) copy(text);
}

// Preset buttons
presets.forEach(p => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = `${p}%`;
  btn.onclick = () => {
    selectedPreset = p;
    customPctEl.value = "";
    calcAndAutoCopyDiscount();
  };
  buttonsEl.appendChild(btn);
});

// Inputs
amountEl.oninput = () => {
  if (selectedPreset !== null || customPctEl.value !== "") {
    calcAndAutoCopyDiscount();
  } else {
    calcDiscount();
  }
};

customPctEl.oninput = () => {
  selectedPreset = null;
  customPctEl.value ? calcAndAutoCopyDiscount() : calcDiscount();
};

copyBtn.onclick = () => {
  if (lastDiscountText) copy(lastDiscountText);
};

// ---------------- Find % logic ----------------
// Percentage difference RELATIVE TO PART (A)
// Shows negative only when applicable
function calcBetween() {
  const a = toNumber(partEl.value);
  const b = toNumber(totalEl.value);

  if (a === null || b === null) {
    betweenResultEl.textContent = "—";
    betweenStatusEl.textContent = "Enter A and B to calculate.";
    return;
  }

  if (a === 0) {
    betweenResultEl.textContent = "—";
    betweenStatusEl.textContent = "Part (A) cannot be 0.";
    return;
  }

  const pct = ((a - b) / a) * 100;
  betweenResultEl.textContent = `${pct.toFixed(2)}%`;
  betweenStatusEl.textContent = "Percentage difference (relative to A).";
}

partEl.oninput = calcBetween;
totalEl.oninput = calcBetween;

// ---------------- Default ----------------
setTab("discount");