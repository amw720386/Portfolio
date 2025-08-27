const SIZE = 9, BOX = 3;
const boardEl = document.getElementById('board');
const notesBtn = document.getElementById('notesBtn');
const autoNotesBtn = document.getElementById('autoNotesBtn');
const hintBtn = document.getElementById('hintBtn');
const eraseBtn = document.getElementById('eraseBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const newBtn = document.getElementById('newBtn');
const difficultySel = document.getElementById('difficulty');
const checkBtn = document.getElementById('checkBtn');
const resetNotesBtn = document.getElementById('resetNotesBtn');
const restartBtn = document.getElementById('restartBtn');
const importStr = document.getElementById('importStr');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');

const numTemplate = document.getElementById('numTemplate');
const numpad = document.getElementById('numpad');

const numButtons = {};

let state = emptyBoard();
let selected = { r: 0, c: 0 };
let notesMode = false;
const undoStack = [];
const redoStack = [];

function ensureWinModal(){
    if (document.getElementById('winOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'winOverlay';
    overlay.className = 'win-overlay';
  
    const modal = document.createElement('div');
    modal.className = 'win-modal';
    modal.innerHTML = `
      <button class="win-close" aria-label="Close">✕</button>
      <h2 class="text-2xl font-bold mb-2">You did it! 🎉</h2>
      <p class="text-sm opacity-80">Nice solve. start a new game from the top bar, or restart with the same difficulty.</p>
      <div class="win-actions">
        <button id="winRestart" class="px-3 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">Restart</button>
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  
    modal.querySelector('.win-close').addEventListener('click', ()=> overlay.style.display='none');
    modal.querySelector('#winRestart').addEventListener('click', ()=>{ overlay.style.display='none'; newGame(); });
}
  
function showWinModal(){
    ensureWinModal();
    const overlay = document.getElementById('winOverlay');
    overlay.style.display = 'flex';
}
  
function checkSolvedAndShow(){
    const ok = state.cells.every(row => row.every(c => c.value && !c.conflict));
    if (ok) showWinModal();
}  


function emptyBoard(){
    const cells = [];
    for(let r=0;r<SIZE;r++){
    const row=[];
    for(let c=0;c<SIZE;c++){
        row.push({ value:0, given:false, notes:[], conflict:false });
    }
    cells.push(row);
    }
    return { cells, mistakes:0, startedAt: Date.now()/1000|0 };
}

const RC = (r,c)=> r*SIZE+c;
function copyVals(st){ const a=[]; for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) a.push(st.cells[r][c].value); return a; }

function rowVals(a,r){ return a.slice(r*SIZE, r*SIZE+SIZE); }
function colVals(a,c){ const out=[]; for(let r=0;r<SIZE;r++) out.push(a[r*SIZE+c]); return out; }
function boxVals(a,r,c){ const br=Math.floor(r/BOX)*BOX, bc=Math.floor(c/BOX)*BOX; const out=[];
    for(let rr=0; rr<BOX; rr++) for(let cc=0; cc<BOX; cc++) out.push(a[(br+rr)*SIZE + (bc+cc)]);
    return out;
}
function candidatesAt(a,r,c){
    if(a[RC(r,c)]!==0) return [];
    const used = new Set([
    ...rowVals(a,r).filter(Boolean),
    ...colVals(a,c).filter(Boolean),
    ...boxVals(a,r,c).filter(Boolean)
    ]);
    const cand=[]; for(let v=1; v<=9; v++) if(!used.has(v)) cand.push(v); return cand;
}
function findNextCellMRV(a){
    let best=null, bestLen=10;
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    const i=RC(r,c);
    if(a[i]===0){
        const cand=candidatesAt(a,r,c);
        if(cand.length<bestLen){ best={r,c,cand}; bestLen=cand.length; if(bestLen===1) return best; }
    }
    }
    return best;
}
function shuffled(nums){ const a=[...nums]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function solveBacktrack(a){
    const slot=findNextCellMRV(a);
    if(!slot) return {solved:true, arr:a};
    const {r,c,cand}=slot;
    for(const v of shuffled(cand)){
    a[RC(r,c)]=v;
    const res=solveBacktrack(a);
    if(res.solved) return res;
    a[RC(r,c)]=0;
    }
    return {solved:false};
}
function countSolutions(a, limit=2){
    let count=0;
    (function dfs(b){
    if(count>=limit) return;
    const s=findNextCellMRV(b);
    if(!s){ count++; return; }
    const {r,c,cand}=s;
    for(const v of cand){
        b[RC(r,c)]=v;
        dfs(b);
        if(count>=limit) return;
        b[RC(r,c)]=0;
    }
    })(a.slice());
    return count;
}
function generatePuzzle(diff='medium'){
    const base=new Array(81).fill(0);
    for(let b=0;b<3;b++){
    const nums=shuffled([1,2,3,4,5,6,7,8,9]); let k=0;
    for(let r=0;r<BOX;r++) for(let c=0;c<BOX;c++){ base[RC(b*BOX+r, b*BOX+c)] = nums[k++]; }
    }
    const solved=solveBacktrack(base.slice()); if(!solved.solved) throw new Error('gen fail');
    const full=solved.arr.slice();

    const puzzle=full.slice(); const positions=shuffled([...Array(81).keys()]);
    const targets={easy:40, medium:32, hard:28, expert:23};
    let clues=81, minClues=targets[diff]||32;
    for(const pos of positions){
    const bak=puzzle[pos]; if(!bak) continue;
    puzzle[pos]=0;
    if(countSolutions(puzzle.slice(),2)!==1){ puzzle[pos]=bak; } else { clues--; if(clues<=minClues) break; }
    }
    return { puzzle, solution: full };
}

function updateNotesButtonUI(){
    notesBtn.classList.remove('btn-notes-on','btn-notes-off');
    notesBtn.classList.add(notesMode ? 'btn-notes-on' : 'btn-notes-off');
  
    let chip = notesBtn.querySelector('.notes-state');
    if (!chip) {
      notesBtn.innerHTML = 'Notes: <span class="notes-state"></span>';
      chip = notesBtn.querySelector('.notes-state');
    }
    chip.textContent = notesMode ? 'On' : 'Off';
}

function updateNumPad(){
    const counts = Array(10).fill(0);
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
      const v = state.cells[r][c].value|0;
      if (v) counts[v]++;
    }
    for(let n=1;n<=9;n++){
      const full = counts[n] >= 9;
      numButtons[n]?.classList.toggle('disabled', full);
    }
}

function renderShell(){
    boardEl.innerHTML='';
    for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
        const btn=document.createElement('button');
        btn.className='cell relative border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-semibold';
        if(c%3===0) btn.classList.add('bL');
        if(c%3===2) btn.classList.add('bR');
        if(r%3===0) btn.classList.add('bT');
        if(r%3===2) btn.classList.add('bB');
        btn.dataset.r=r; btn.dataset.c=c;
        btn.addEventListener('click',()=> setSelected(r,c));
        boardEl.appendChild(btn);
    }
    }
}

function renderCell(r,c){
    const btn = boardEl.children[RC(r,c)];
    const cell = state.cells[r][c];
    btn.innerHTML = '';
  
    btn.classList.remove(
      'ring','ring-yellow-400','ring-offset-1','bg-yellow-50','dark:bg-yellow-900/30',
      'ring-2','ring-blue-300','ring-offset-0',
      'bg-blue-100','dark:bg-blue-900/30',
      'hl-same','hl-note','cell-filled'
    );
  
    const isSelected = (selected.r === r && selected.c === c);
    btn.classList.toggle('selected', isSelected);
  
    if (cell.value){
      const v = document.createElement('div');
      v.textContent = cell.value;
      v.className = 'select-none ' + (cell.given ? 'text-zinc-900 dark:text-white'
                                                : 'text-blue-600 dark:text-blue-300');
      btn.appendChild(v);
    } else {
      const grid = document.createElement('div');
      grid.className = 'notes w-full h-full p-1 text-zinc-500 dark:text-zinc-400';
      const selVal = state.cells[selected.r][selected.c].value || 0;
  
      for (let n = 1; n <= 9; n++){
        const s = document.createElement('span');
        if (cell.notes.includes(n)) {
          s.textContent = n;
          if (selVal === n) s.classList.add('text-blue-600','dark:text-blue-300','font-bold');
        } else {
          s.textContent = '';
        }
        grid.appendChild(s);
      }
      btn.appendChild(grid);
    }
  
    btn.classList.toggle('bg-red-100', cell.conflict);
    btn.classList.toggle('dark:bg-red-900/30', cell.conflict);
  
    if (cell.value && !cell.conflict) btn.classList.add('cell-filled');
  
    const selVal = state.cells[selected.r][selected.c].value || 0;
  
    if (selVal && cell.value === selVal) {
      btn.classList.add('hl-same');
    }
  
    if (!cell.value && selVal && cell.notes.includes(selVal)) {
      btn.classList.add('hl-note');
    }
}  


function renderAll(){ for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) renderCell(r,c); updateNumPad(); checkSolvedAndShow(); }

function setSelected(r,c){ selected={r,c}; renderAll(); }

function isValidAt(a,r,c,v){
    if(v===0) return true;
    const old=a[RC(r,c)]; a[RC(r,c)]=0;
    const ok = !(rowVals(a,r).includes(v) || colVals(a,c).includes(v) || boxVals(a,r,c).includes(v));
    a[RC(r,c)]=old; return ok;
}
function recalcConflicts(){
    const a = copyVals(state);
    for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
        const v=a[RC(r,c)];
        if(!v){ state.cells[r][c].conflict=false; continue; }
        a[RC(r,c)]=0;
        const bad = (rowVals(a,r).includes(v) || colVals(a,c).includes(v) || boxVals(a,r,c).includes(v));
        a[RC(r,c)]=v;
        state.cells[r][c].conflict = bad;
    }
    }
}

function pushUndo(){ undoStack.push(JSON.stringify(state)); if(undoStack.length>200) undoStack.shift(); }
function restore(json){ state = JSON.parse(json); renderAll(); }

function placeNumber(n){
    const {r,c}=selected; const cell=state.cells[r][c]; if(cell.given) return;
    pushUndo(); redoStack.length=0;
    if(notesMode){
    const i=cell.notes.indexOf(n); if(i===-1) cell.notes.push(n); else cell.notes.splice(i,1);
    } else {
    cell.value=n; cell.notes=[];
    }
    recalcConflicts(); renderAll();
}
function eraseCell(){
    const {r,c}=selected; const cell=state.cells[r][c]; if(cell.given) return;
    pushUndo(); redoStack.length=0; cell.value=0; cell.notes=[]; recalcConflicts(); renderAll();
}

function toggleNoteAtSelected(n){
    const { r, c } = selected;
    const cell = state.cells[r][c];
    if (cell.given || cell.value) return;
    pushUndo(); 
    redoStack.length = 0;
    const i = cell.notes.indexOf(n);
    if (i === -1) cell.notes.push(n); else cell.notes.splice(i, 1);
    renderAll();
}


function autoNotes(){
    const a=copyVals(state); pushUndo(); redoStack.length=0;
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    const cell=state.cells[r][c];
    if(cell.value===0) cell.notes = candidatesAt(a,r,c);
    }
    renderAll();
}
function giveHint(){
    const a=copyVals(state); let target=null;
    for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
        if(a[RC(r,c)]===0){
        const cand=candidatesAt(a,r,c);
        if(cand.length===1){ target={r,c,v:cand[0]}; break; }
        }
    }
    if(target) break;
    }
    if(!target){
    const s=solveBacktrack(a.slice()); if(!s.solved){ alert('No hint available.'); return; }
    for(let r=0;r<SIZE;r++){ for(let c=0;c<SIZE;c++){ if(a[RC(r,c)]===0){ target={r,c,v:s.arr[RC(r,c)]}; break; } } if(target) break; }
    }
    if(target){ setSelected(target.r,target.c); placeNumber(target.v); }
}
function doCheck(){
    recalcConflicts(); renderAll();
    const a=copyVals(state);
    if(a.some(x=>x===0)){ alert('Not complete yet.'); return; }
    if(state.cells.flat().some(c=>c.conflict)) alert('There are mistakes.'); else alert('Looks good!');
}
function clearNotes(){ pushUndo(); redoStack.length=0; for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) state.cells[r][c].notes=[]; renderAll(); }
function restartPuzzle(){
    pushUndo(); redoStack.length=0;
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    const cell=state.cells[r][c]; if(!cell.given){ cell.value=0; cell.notes=[]; cell.conflict=false; }
    }
    renderAll();
}
function newGame(){
    const diff = difficultySel.value;
    try{
    const {puzzle} = generatePuzzle(diff);
    const st = emptyBoard(); let k=0;
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
        const v=puzzle[k++]; st.cells[r][c].value=v||0; st.cells[r][c].given=v!==0;
    }
    state = st; undoStack.length=0; redoStack.length=0;
    renderAll(); setSelected(0,0);
    }catch(e){ console.error(e); alert('Failed to generate. Try again.'); }
}
function importBoard(){
    const s=importStr.value.trim().replace(/\./g,'0'); if(s.length!==81 || /[^0-9]/.test(s)){ alert('Need 81 digits (0 for empty).'); return; }
    const st=emptyBoard(); let k=0;
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){ const v=+s[k++]||0; st.cells[r][c].value=v; st.cells[r][c].given=v!==0; }
    state=st; undoStack.length=0; redoStack.length=0; renderAll(); setSelected(0,0);
}
function exportBoard(){
    const a=copyVals(state); const str=a.map(v=>v||0).join('');
    importStr.value=str; navigator.clipboard?.writeText(str).catch(()=>{});
    alert('Exported to input (and clipboard if permitted).');
}

notesBtn.addEventListener('click', ()=>{ notesMode=!notesMode; updateNotesButtonUI(); });
autoNotesBtn.addEventListener('click', autoNotes);
hintBtn.addEventListener('click', giveHint);
eraseBtn.addEventListener('click', eraseCell);
undoBtn.addEventListener('click', ()=>{ if(!undoStack.length) return; const cur=JSON.stringify(state); redoStack.push(cur); const prev=undoStack.pop(); restore(prev); });
redoBtn.addEventListener('click', ()=>{ if(!redoStack.length) return; const cur=JSON.stringify(state); undoStack.push(cur); const next=redoStack.pop(); restore(next); });
newBtn.addEventListener('click', newGame);
checkBtn.addEventListener('click', doCheck);
resetNotesBtn.addEventListener('click', clearNotes);
restartBtn.addEventListener('click', restartPuzzle);
importBtn.addEventListener('click', importBoard);
exportBtn.addEventListener('click', exportBoard);

document.addEventListener('keydown', (e)=>{
    if (e.target.closest('input, textarea, [contenteditable]')) return;
  
    const k = e.key;
    const cmd = e.ctrlKey || e.metaKey; 
  
    if (cmd && k.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      if(!undoStack.length) return;
      const cur = JSON.stringify(state);
      redoStack.push(cur);
      const prev = undoStack.pop();
      restore(prev);
      return;
    }
    if (cmd && (k.toLowerCase() === 'y' || (k.toLowerCase() === 'z' && e.shiftKey))) {
      e.preventDefault();
      if(!redoStack.length) return;
      const cur = JSON.stringify(state);
      undoStack.push(cur);
      const next = redoStack.pop();
      restore(next);
      return;
    }
  
    if (cmd && k >= '1' && k <= '9') {
      e.preventDefault();
      toggleNoteAtSelected(+k);
      return;
    }
  
    if (k >= '1' && k <= '9') { placeNumber(+k); return; }
    if (k === '0' || k === 'Backspace' || k === 'Delete') { eraseCell(); return; }
  
    // --- Wrap-around movement ---
    if (k === 'ArrowUp')    { setSelected((selected.r - 1 + SIZE) % SIZE, selected.c); return; }
    if (k === 'ArrowDown')  { setSelected((selected.r + 1) % SIZE,       selected.c); return; }
    if (k === 'ArrowLeft')  { setSelected(selected.r, (selected.c - 1 + SIZE) % SIZE); return; }
    if (k === 'ArrowRight') { setSelected(selected.r, (selected.c + 1) % SIZE);       return; }
  
    if (k === 'n' || k === 'N') { 
      notesMode = !notesMode; 
      updateNotesButtonUI(); 
      return; 
    }
});  


function buildNumPad(){
    numpad.innerHTML='';
    for(let n=1;n<=9;n++){
    const btn = numTemplate.content.firstElementChild.cloneNode(true);
    btn.textContent = n;
    btn.classList.add('numKey');
    btn.addEventListener('click', ()=> placeNumber(n));
    numpad.appendChild(btn);
    numButtons[n] = btn;
    }
}
function recalcConflictsAndRender(){ recalcConflicts(); renderAll(); }
function boot(){
    renderShell();
    buildNumPad();
    state = emptyBoard();
    renderAll();
    setSelected(0,0);
    updateNotesButtonUI();
    recalcConflictsAndRender();
}
boot();