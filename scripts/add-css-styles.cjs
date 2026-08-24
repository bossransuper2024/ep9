const fs = require('fs');
const f = 'public/assets/css/style.css';
let t = fs.readFileSync(f, 'utf8');

const marker = '.txt-img { display: block; max-width: 100%; height: auto; margin: 18px auto; border-radius: 10px; border: 1px solid var(--line); }';
const idx = t.indexOf(marker);
if (idx === -1) { console.log('marker not found'); process.exit(1); }

const newCss = marker + `

/* Tables */
.txt-table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 0.95em; }
.txt-table th, .txt-table td { padding: 10px 14px; border: 1px solid var(--line); text-align: left; }
.txt-table th { background: var(--bg-3); font-family: var(--font-display); font-weight: 700; color: var(--accent); }
.txt-table tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
.txt-table tr:hover td { background: rgba(var(--accent-rgb),0.05); }

/* Callout boxes */
.txt-callout { background: linear-gradient(135deg, rgba(var(--accent-rgb),0.12), rgba(var(--accent-rgb),0.04)); border: 1px solid rgba(var(--accent-rgb),0.3); border-radius: 12px; padding: 20px 24px; margin: 18px 0; position: relative; }
.txt-callout::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--accent); border-radius: 12px 0 0 12px; }

/* Blockquotes */
.txt-quote { border-left: 3px solid var(--accent); padding-left: 20px; margin: 18px 0; color: var(--text-dim); font-style: italic; background: rgba(var(--accent-rgb),0.05); padding: 16px 20px; border-radius: 0 10px 10px 0; }

/* Inline code */
.txt-code { background: rgba(0,0,0,0.4); padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.9em; color: var(--accent); border: 1px solid var(--line); }

/* Columns - 2 column layout */
.txt-col { display: flex; flex-wrap: wrap; gap: 24px; margin: 18px 0; }
.txt-col > * { flex: 1 1 45%; min-width: 280px; }

/* Columns - 3 column layout */
.txt-col3 { display: flex; flex-wrap: wrap; gap: 20px; margin: 18px 0; }
.txt-col3 > * { flex: 1 1 30%; min-width: 200px; }

/* Horizontal rule */
.txt-hr { border: none; border-top: 1px solid var(--line); margin: 24px 0; opacity: 0.5; }


/* News popup */`;

const newT = t.slice(0, idx) + newCss + t.slice(idx + marker.length);
fs.writeFileSync(f, newT);
console.log('added CSS styles for new inline elements');