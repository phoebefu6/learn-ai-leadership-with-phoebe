/* leadership-live.js - the decision-quality lever simulator (learn-ai-leadership-with-phoebe).
   Reusable "watch the number climb" pattern (see finance-live / marketing-live / brand-live).
   Deterministic, offline, no dependencies. Renders into #leadership-live.

   Teaching idea: a manager uses AI on a real decision. Toggling the levers (frame the real
   decision, add context, widen the options, stress-test for bias, apply human judgment) turns
   a confident-but-shallow AI answer into a decision-grade brief - and a scorecard shows how
   many decision types come out sound. The "model" is a scripted teaching simulation; the
   lesson (AI structures the decision, the leader owns it) is real. */
(function () {
  var host = document.getElementById("leadership-live");
  if (!host) return;

  var LEVERS = [
    { id: "framing",  label: "Frame the real decision", hint: "the question, not the symptom", pts: 30 },
    { id: "context",  label: "Add context + data",      hint: "the actual situation",           pts: 18 },
    { id: "options",  label: "Widen the options",        hint: "more than a binary",             pts: 15 },
    { id: "bias",     label: "Stress-test for bias",     hint: "pre-mortem + missing views",     pts: 15 },
    { id: "judgment", label: "Apply human judgment",     hint: "values, people, you own it",     pts: 12 }
  ];

  var state = { framing: false, context: false, options: false, bias: false, judgment: false, mode: "live" };

  function score() {
    var s = 10;
    LEVERS.forEach(function (l) { if (state[l.id]) s += l.pts; });
    return Math.min(100, s);
  }

  /* four decision types; each is "sound" only with the levers it truly needs.
     People decisions need bias + judgment; reorg/tool need context + options. */
  var DECISIONS = [
    { name: "A hiring call",       need: ["framing", "bias", "judgment"], why: "people: bias + human call" },
    { name: "A team reorg",        need: ["framing", "context", "options"], why: "situation + real options" },
    { name: "A tool adoption",     need: ["framing", "context", "options"], why: "situation + real options" },
    { name: "A priority tradeoff", need: ["framing", "options", "judgment"], why: "options + values call" }
  ];
  function decOk(d) { return d.need.every(function (k) { return state[k]; }); }
  function sound() { return DECISIONS.filter(decOk).length; }

  function draft() {
    var parts = [];
    if (!state.framing) {
      parts.push({ warn: true, label: "AI recommendation", t: "You should probably just go ahead - it is a good idea and most teams do it, so the upside likely outweighs the risk." });
      parts.push({ warn: true, t: "(No real decision framed, so the AI answers a vague question with a generic, confident push. This is how AI rushes a leader into the wrong call - fluent, agreeable, and shallow.)" });
      return parts;
    }
    parts.push({ warn: false, label: "The decision", t: "Decision framed: not \"should we do X\" but \"what is the best way to solve the underlying problem, of which X is one option?\"" });

    var body = "";
    if (state.context) body += "Grounded in the actual situation - the team's current load, the constraint that triggered this, and what has been tried. ";
    else body += "(No context or data attached, so the analysis floats above your real situation.) ";
    if (state.options) body += "Three genuine options laid out with tradeoffs, not a yes/no - including a do-nothing baseline. ";
    else body += "(Framed as a binary, so the best answer - often a third option - never appears.) ";
    parts.push({ warn: false, label: "Analysis", t: body.trim() });

    if (state.bias) parts.push({ warn: false, label: "Stress test", t: "Pre-mortem: if this fails in six months, here is why. Plus: whose perspective is missing, and what would change the recommendation." });
    else parts.push({ warn: true, label: "Stress test", t: "No pre-mortem or bias check, so confirmation bias and blind spots ride straight into the decision." });

    if (state.judgment) parts.push({ warn: false, label: "Your call", t: "The values call and the human impact are yours: the model has structured the decision, but you weigh the people, own the outcome, and decide. It never signs." });
    return parts;
  }

  host.innerHTML =
    '<div class="ll-shell">' +
      '<div class="ll-controls">' +
        '<div class="ll-ctitle">Raise the decision quality</div>' +
        '<div class="ll-levers"></div>' +
        '<div class="ll-modes">' +
          '<button type="button" class="ll-mode ll-on" data-mode="live">Live decision</button>' +
          '<button type="button" class="ll-mode" data-mode="score">Decision scorecard</button>' +
        '</div>' +
      '</div>' +
      '<div class="ll-stage">' +
        '<div class="ll-meters">' +
          '<div class="ll-meter"><span class="ll-mlabel">Decision quality</span><span class="ll-mval" id="ll-score">10</span><div class="ll-bar"><i id="ll-bar"></i></div></div>' +
          '<div class="ll-meter"><span class="ll-mlabel">Decision types sound</span><span class="ll-mval" id="ll-sound">0 / 4</span></div>' +
        '</div>' +
        '<div id="ll-body"></div>' +
        '<p class="ll-rail">This model is a scripted teaching simulation - a real LLM words things differently. What is real is the lesson: AI can structure a decision and widen your options, but the framing, the values, the people impact, and the accountability are the leader’s. AI advises; you decide and own it.</p>' +
      '</div>' +
    '</div>';

  var leverWrap = host.querySelector(".ll-levers");
  LEVERS.forEach(function (l) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "ll-lever";
    b.setAttribute("data-lever", l.id);
    b.innerHTML = '<span class="ll-sw"></span><span class="ll-ltext"><b>' + l.label + '</b><span>' + l.hint + '</span></span>';
    b.addEventListener("click", function () { state[l.id] = !state[l.id]; render(); });
    leverWrap.appendChild(b);
  });
  host.querySelectorAll(".ll-mode").forEach(function (m) {
    m.addEventListener("click", function () { state.mode = m.getAttribute("data-mode"); render(); });
  });

  function render() {
    host.querySelectorAll(".ll-lever").forEach(function (b) {
      b.classList.toggle("ll-active", !!state[b.getAttribute("data-lever")]);
    });
    host.querySelectorAll(".ll-mode").forEach(function (m) {
      m.classList.toggle("ll-on", m.getAttribute("data-mode") === state.mode);
    });
    var s = score();
    host.querySelector("#ll-score").textContent = s;
    host.querySelector("#ll-bar").style.width = s + "%";
    var so = sound();
    var sEl = host.querySelector("#ll-sound");
    sEl.textContent = so + " / 4";
    sEl.className = "ll-mval" + (so === 4 ? " ll-good" : "");

    var body = host.querySelector("#ll-body");
    if (state.mode === "score") {
      var rows = DECISIONS.map(function (d) {
        var ok = decOk(d);
        return '<tr class="' + (ok ? "ll-r-ok" : "ll-r-no") + '"><td>' + d.name + '</td><td>' + d.why +
          '</td><td class="ll-rmark">' + (ok ? "✓" : "✗") + '</td></tr>';
      }).join("");
      body.innerHTML =
        '<div class="ll-scorehead">' + so + ' of 4 decision types come out sound <b>(' + Math.round((so / 4) * 100) + '%)</b></div>' +
        '<table class="ll-table"><thead><tr><th>Decision type</th><th>Sound when</th><th>OK?</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<p class="ll-note">Different decisions need different levers - people decisions demand a bias check and your judgment. Turn them on and watch every type come out sound.</p>';
    } else {
      var d = draft();
      body.innerHTML =
        '<div class="ll-draftlabel">AI decision support</div>' +
        '<div class="ll-draft">' + d.map(function (p) {
          var lab = p.label ? '<span class="ll-tag">' + p.label + '</span> ' : '';
          return '<p class="ll-line' + (p.warn ? " ll-warn" : "") + '">' + lab + p.t + '</p>';
        }).join("") + '</div>';
    }
  }

  render();
})();
