const VERBS = RAW.trim().split("\n").map(line => {
  const [inf, sg, pl, pp, aux, es] = line.split("|");
  return { inf, sg: sg.split("/"), pl: pl.split("/"), pp, aux, es: es.split(",").map(s => s.trim()) };
});
const BY_INF = Object.fromEntries(VERBS.map(v => [v.inf, v]));
const AUX_TEXT = { h: "heeft", z: "is", hz: "heeft / is" };
const KEYS = ["sg", "pl", "pp", "es"];

const $ = id => document.getElementById(id);
const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

let current = null;
let checked = false;
let score = { ok: 0, total: 0 };

$("verbs").innerHTML = VERBS.map(v => `<option value="${v.inf}">`).join("");

function solution(k, v) {
  if (k === "sg") return v.sg.join(" / ");
  if (k === "pl") return v.pl.join(" / ");
  if (k === "pp") return `${AUX_TEXT[v.aux]} ${v.pp}`;
  return v.es.join(", ");
}

function isCorrect(k, v, answer) {
  const a = norm(answer);
  if (!a) return false;
  if (k === "sg" || k === "pl") return v[k].some(f => norm(f) === a);
  if (k === "pp") {
    const m = a.match(/^(heeft|hebben|is|zijn)\s+(.+)$/);
    const form = m ? m[2] : a;
    if (form !== v.pp) return false;
    if (!m) return true;
    const used = m[1] === "heeft" || m[1] === "hebben" ? "h" : "z";
    return v.aux.includes(used);
  }
  // Significado: vale cualquiera de las traducciones, con o sin "se" final y sin tildes
  const strip = s => norm(s).replace(/se$/, "");
  return a.split(/[,;\/]| o /).map(s => s.trim()).filter(Boolean)
    .some(part => v.es.some(e => strip(e) === strip(part)));
}

function load(inf) {
  current = BY_INF[inf];
  checked = false;
  $("inf").textContent = current.inf;
  $("search").value = "";
  $("summary").hidden = true;
  document.querySelectorAll(".row").forEach(r => {
    r.classList.remove("ok", "bad");
    r.querySelector("input").value = "";
    r.querySelector(".fb").innerHTML = "";
  });
  $("a-sg").focus({ preventScroll: true });
}

function randomVerb() {
  let v;
  do { v = VERBS[Math.floor(Math.random() * VERBS.length)]; } while (current && v === current && VERBS.length > 1);
  load(v.inf);
}

function mark(row, ok, k) {
  row.classList.toggle("ok", ok);
  row.classList.toggle("bad", !ok);
  const sol = solution(k, current);
  const fb = row.querySelector(".fb");
  if (ok) {
    fb.innerHTML = k === "es" ? `Correcto. Otras opciones: <b>${sol}</b>` : `Correcto: <b>${sol}</b>`;
  } else {
    fb.innerHTML = `Solución: <b>${sol}</b>`;
    if (k === "es" && row.querySelector("input").value.trim()) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Mi respuesta también vale";
      btn.onclick = () => { mark(row, true, k); score.ok++; updateScore(); updateSummary(); };
      fb.append(btn);
    }
  }
}

function updateScore() { $("score").textContent = `${score.ok} / ${score.total} correctas`; }

function updateSummary() {
  const n = document.querySelectorAll(".row.ok").length;
  const s = $("summary");
  s.hidden = false;
  s.className = "summary " + (n === 4 ? "ok" : "bad");
  s.textContent = n === 4 ? "¡Perfecto! 4 de 4." : `${n} de 4 correctas. Repasa las que están en rojo.`;
}

function check() {
  if (checked) return;
  checked = true;
  KEYS.forEach(k => {
    const row = document.querySelector(`.row[data-k="${k}"]`);
    const ok = isCorrect(k, current, row.querySelector("input").value);
    mark(row, ok, k);
    score.total++;
    if (ok) score.ok++;
  });
  updateScore();
  updateSummary();
  $("next").focus({ preventScroll: true });
}

$("quiz").addEventListener("submit", e => { e.preventDefault(); check(); });
$("quiz").addEventListener("keydown", e => {
  if (e.key !== "Enter" || e.target.tagName !== "INPUT") return;
  const i = KEYS.indexOf(e.target.id.slice(2));
  if (i < KEYS.length - 1) { e.preventDefault(); $("a-" + KEYS[i + 1]).focus(); }
});
$("reveal").onclick = () => {
  if (!checked) { checked = true; score.total += 4; updateScore(); }
  KEYS.forEach(k => {
    const row = document.querySelector(`.row[data-k="${k}"]`);
    if (!row.classList.contains("ok")) mark(row, false, k);
  });
};
$("next").onclick = randomVerb;
$("rand").onclick = randomVerb;

function pick() {
  const inf = norm($("search").value);
  if (BY_INF[inf]) load(inf);
  else if (inf) {
    const match = VERBS.find(v => v.inf.startsWith(inf));
    if (match) load(match.inf);
    else { $("search").setCustomValidity("Ese verbo no está en la lista."); $("search").reportValidity(); }
  }
}
$("go").onclick = pick;
$("search").addEventListener("input", () => {
  $("search").setCustomValidity("");
  if (BY_INF[norm($("search").value)]) pick();
});
$("search").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); pick(); } });

load("gaan");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
