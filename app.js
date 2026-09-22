const spendingForm = document.querySelector('#spendingForm');
const activityList = document.querySelector('#activityList');
const emptyState = document.querySelector('#emptyState');
const available = document.querySelector('#available');
const spent = document.querySelector('#spent');
const budgetDisplay = document.querySelector('#budget');
const balanceFill = document.querySelector('#balanceFill');
const dateInput = document.querySelector('#date');
const formNote = document.querySelector('#formNote');
let budget = 250;
document.querySelector('#dateDisplay').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
let items = [];
const jarCoins = document.querySelector('#jarCoins');
for (let i = 0; i < 60; i += 1) { const coin = document.createElement('span'); coin.className = `jar-coin${i === 13 || i === 42 ? ' medallion' : ''}`; coin.style.left = `${(i % 5) * 8 - 1}px`; coin.style.bottom = `${Math.floor(i / 5) * 4 - 1}px`; jarCoins.appendChild(coin); }
dateInput.value = new Date().toISOString().slice(0, 10);

function formatDate(value) {
  const d = new Date(`${value}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d > today ? `Due ${label}` : label;
}
function updateWater(percent, pour = true) {
  const level = Math.max(0, Math.min(100, percent));
  document.querySelector('#waterFill').style.height = `${level}%`;
  document.querySelector('#waterCaption').textContent = `${Math.round(level)}% full`;
  const stream = document.querySelector('#waterStream');
  stream.classList.remove('pouring');
  void stream.offsetWidth;
  if (pour && level > 0) stream.classList.add('pouring');
}
function triggerDrain() {
  const cup = document.querySelector('#waterCup');
  let drain = document.querySelector('#drainStream');
  if (!drain) { drain = document.createElement('span'); drain.id = 'drainStream'; drain.className = 'drain-stream'; drain.setAttribute('aria-hidden', 'true'); document.querySelector('.water-visual').appendChild(drain); }
  cup.classList.remove('draining');
  drain.classList.remove('draining');
  void cup.offsetWidth;
  void drain.offsetWidth;
  cup.classList.add('draining');
  drain.classList.add('draining');
  setTimeout(() => { cup.classList.remove('draining'); drain.classList.remove('draining'); }, 700);
}
function render() {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  spent.textContent = `$${total.toFixed(2)}`;
  const remaining = budget - total;
  available.textContent = remaining < 0 ? `-$${Math.abs(remaining).toFixed(2)}` : `$${remaining.toFixed(2)}`;
  budgetDisplay.textContent = `$${budget.toFixed(2)}`;
  balanceFill.style.width = `${budget > 0 ? Math.min(100, total / budget * 100) : 0}%`;
  balanceFill.classList.toggle('debt', remaining < 0);
  const jarPercent = budget > 0 ? Math.max(0, Math.min(100, remaining / budget * 100)) : 0;
  document.querySelector('#jarCoins').style.clipPath = `inset(${100 - jarPercent}% 0 0 0)`;
  document.querySelector('#jarCaption').textContent = `${Math.round(jarPercent)}% budget left`;
  activityList.innerHTML = items.slice(0, 5).map(item => `<li class="activity-item"><span class="activity-icon" style="background:${item.color}">${item.icon}</span><div class="activity-copy"><strong>${item.name}</strong><small>${formatDate(item.date)}</small></div><span class="activity-cost">-$${item.amount.toFixed(2)}</span></li>`).join('');
  emptyState.hidden = items.length > 0;
  updateWater(Number(document.querySelector('#saved').textContent.replace('$', '')) / Number(document.querySelector('#goalTarget').textContent) * 100);
}
spendingForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(spendingForm);
  const amount = Number(data.get('amount'));
  if (!data.get('item') || !amount || amount < 0) return;
  items.unshift({ name: data.get('item'), amount, date: data.get('date'), icon: '🛍️', color: '#ffe3e8' });
  render();
  spendingForm.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  formNote.textContent = 'Added! You’re keeping track like a pro ✦';
  setTimeout(() => { formNote.textContent = ''; }, 3500);
});
document.querySelector('#addSavings').addEventListener('click', () => { document.querySelector('#savingsForm').hidden = false; document.querySelector('#savedInput').focus(); });
document.querySelector('#savingsForm').addEventListener('submit', event => { event.preventDefault(); const amount = Number(document.querySelector('#savedInput').value); if (!amount || amount < 0) return; const saved = document.querySelector('#saved'); const current = Number(saved.textContent.replace('$', '')); const target = Number(document.querySelector('#goalTarget').textContent); const next = Math.min(target, current + amount); saved.textContent = `$${next.toFixed(2).replace(/\.00$/, '')}`; const percent = next / target * 100; document.querySelector('#goalFill').style.width = `${percent}%`; updateWater(percent); document.querySelector('#goalMessage').textContent = next === target ? 'Goal reached — amazing!' : `${Math.round(percent)}% there — nice!`; event.currentTarget.reset(); event.currentTarget.hidden = true; });
document.querySelector('#removeSavings').addEventListener('click', () => { document.querySelector('#removeForm').hidden = false; document.querySelector('#removeInput').focus(); });
document.querySelector('#removeForm').addEventListener('submit', event => { event.preventDefault(); const amount = Number(document.querySelector('#removeInput').value); if (!amount || amount < 0) return; const saved = document.querySelector('#saved'); const current = Number(saved.textContent.replace('$', '')); const target = Number(document.querySelector('#goalTarget').textContent); const next = Math.max(0, current - amount); saved.textContent = `$${next.toFixed(2).replace(/\.00$/, '')}`; const percent = next / target * 100; document.querySelector('#goalFill').style.width = `${percent}%`; triggerDrain(); updateWater(percent, false); document.querySelector('#goalMessage').textContent = `${Math.round(percent)}% there — keep going!`; event.currentTarget.reset(); event.currentTarget.hidden = true; });
document.querySelector('#editBudget').addEventListener('click', () => { const form = document.querySelector('#budgetForm'); form.hidden = false; const input = document.querySelector('#budgetInput'); input.value = budget; input.focus(); });
document.querySelector('#budgetForm').addEventListener('submit', event => { event.preventDefault(); const value = Number(document.querySelector('#budgetInput').value); if (value < 0 || Number.isNaN(value)) return; budget = value; event.currentTarget.hidden = true; render(); });
document.querySelector('#editGoal').addEventListener('click', () => { const form = document.querySelector('#goalForm'); const input = document.querySelector('#goalInput'); const targetInput = document.querySelector('#targetInput'); form.hidden = false; input.value = document.querySelector('#goalName').textContent; targetInput.value = document.querySelector('#goalTarget').textContent; input.focus(); });
document.querySelector('#goalForm').addEventListener('submit', event => { event.preventDefault(); const input = document.querySelector('#goalInput'); const targetInput = document.querySelector('#targetInput'); const target = Number(targetInput.value); if (input.value.trim()) document.querySelector('#goalName').textContent = input.value.trim(); if (target > 0) { document.querySelector('#goalTarget').textContent = target.toFixed(2).replace(/\.00$/, ''); const saved = Number(document.querySelector('#saved').textContent.replace('$', '')); const percent = Math.min(100, saved / target * 100); document.querySelector('#goalFill').style.width = `${percent}%`; updateWater(percent); document.querySelector('#goalMessage').textContent = percent === 100 ? 'Goal reached — amazing!' : `${Math.round(percent)}% there — nice!`; } event.currentTarget.hidden = true; });
document.querySelector('#dismissTip').addEventListener('click', event => event.currentTarget.closest('.tip').remove());
render();
