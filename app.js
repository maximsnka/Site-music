let members = JSON.parse(localStorage.getItem('cv_members') || '[]');
let history = JSON.parse(localStorage.getItem('cv_history') || '[]');
let sentCount = parseInt(localStorage.getItem('cv_sent') || '0', 10);

const PLANS = { equilibre: '🥗 Programme Équilibre', performance: '💪 Programme Performance', detox: '🌿 Programme Détox', perte_poids: '🏃 Programme Perte de Poids' };
const TIPS = {
  sommeil:     { title: 'Le sommeil, pilier de la performance', text: '7 à 9 heures de sommeil par nuit favorisent la récupération musculaire. Chambre fraîche à 18°C, pas d\''écran 1h avant.' },
  hydratation: { title: 'L\'eau, votre meilleure alliée', text: 'Une déshydratation de 2% réduit les performances de 20%. Buvez 250ml dès le réveil. Avant l\'effort : 500ml, pendant : 150ml toutes les 20 min.' },
  mental:      { title: 'La pleine conscience au quotidien', text: '5 minutes de méditation par jour. Respirez 4-7-8 : inspirez 4s, retenez 7s, expirez 8s.' },
  marche:      { title: 'Marchez, tout simplement', text: '8 000 à 10 000 pas par jour améliorent la santé cardiovasculaire. La régularité prime sur l\'intensité.' },
  rythme:      { title: 'Synchronisez-vous avec votre horloge biologique', text: 'Lumière naturelle dès le réveil. Évitez les repas lourds après 20h.' },
  motivation:  { title: 'Fixez des objectifs SMART', text: 'Spécifique, Mesurable, Atteignable, Réaliste, Temporel. Célébrez chaque petite victoire.' },
};
const PLAN_DETAILS = {
  equilibre: `🥗 PROGRAMME ÉQUILIBRE\nMatin : Porridge avoine + fruits + thé vert\nMidi : Protéines maigres + légumes + féculents\nCollation : Fruits secs + yaourt\nSoir : Soupe + œufs ou poisson + salade\n• 💧 2L eau/jour  • ⏰ Manger lentement  • 🚫 Sucres raffinés limités`,
  performance: `💪 PROGRAMME PERFORMANCE\nMatin : Omelette 3 œufs + pain complet + banane\nPré-séance : Banane + amandes\nMidi : 200g poulet/saumon + riz + brocolis\nPost-séance : Protéines + glucides rapides\nSoir : Viande maigre + légumes + patate douce\n• 💧 3L eau/jour  • 🥩 1.8g protéines/kg  • ⚡ 5 repas/jour`,
  detox: `🌿 PROGRAMME DÉTOX\nMatin : Eau citronnée + smoothie vert + chia\nMidi : Salade composée + légumineuses + avocat\nCollation : Tisane + noix\nSoir : Bouillon légumes + crudités + houmous\n• 🍋 Eau citronnée le matin  • 🥦 80% végétal  • 🚫 Alcool limité`,
  perte_poids: `🏃 PROGRAMME PERTE DE POIDS\nMatin : Yaourt grec + baies + pain complet\nMidi : Protéines maigres + légumes à volonté\nCollation : Fruit + fromage blanc 0%\nSoir : Omelette légumes ou poisson vapeur\n• 📉 -300 kcal/jour  • 🕕 Jeûne 12h la nuit  • 🥗 Assiette 50% légumes`,
};
const OBJECTIF_LABELS = { perte_poids: 'Perte de poids', prise_masse: 'Prise de masse', endurance: 'Endurance', bien_etre: 'Bien-être', flexibilite: 'Flexibilité', nutrition: 'Rééquilibrage alimentaire' };

function save() { localStorage.setItem('cv_members', JSON.stringify(members)); localStorage.setItem('cv_history', JSON.stringify(history)); localStorage.setItem('cv_sent', String(sentCount)); }

function openTab(name) {
  document.querySelectorAll('.nav-btn, .bottom-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-section').forEach(s => s.classList.toggle('active', s.id === 'tab-' + name));
  document.getElementById('hero').style.display = name === 'dashboard' ? '' : 'none';
  if (name === 'envoyer') populateSendSelect();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('.nav-btn, .bottom-nav-btn').forEach(btn => btn.addEventListener('click', () => openTab(btn.dataset.tab)));

function initials(m) { return (m.prenom[0] + m.nom[0]).toUpperCase(); }

function renderDashboard() {
  document.getElementById('dash-count').textContent = members.length;
  document.getElementById('dash-sent').textContent = sentCount;
  document.getElementById('dash-goals').textContent = members.filter(m => m.objectif).length;
  document.getElementById('stat-members').querySelector('.stat-num').textContent = members.length;
  document.getElementById('stat-sent').textContent = sentCount;
  const c = document.getElementById('recent-list');
  if (!members.length) { c.innerHTML = `<div class="empty-state"><span class="empty-icon">🌿</span><p>Aucun adhérent pour le moment.</p><button class="btn-secondary" onclick="openTab('members')">Ajouter un adhérent</button></div>`; return; }
  c.innerHTML = members.slice(-6).reverse().map(m => `<div class="member-card" onclick="openTab('members')"><div class="member-card-avatar">${initials(m)}</div><div class="member-card-name">${m.prenom} ${m.nom}</div><div class="member-card-email">${m.email}</div><span class="member-card-tag">${OBJECTIF_LABELS[m.objectif] || m.objectif}</span></div>`).join('');
}

function renderMemberList() {
  document.getElementById('member-badge').textContent = members.length;
  const c = document.getElementById('member-list');
  if (!members.length) { c.innerHTML = `<div class="empty-state small"><span class="empty-icon">🌿</span><p>Ajoutez votre premier adhérent.</p></div>`; return; }
  c.innerHTML = members.map((m, i) => `<div class="member-item"><div class="member-item-avatar">${initials(m)}</div><div class="member-item-info"><div class="member-item-name">${m.prenom} ${m.nom}</div><div class="member-item-email">${m.email}</div></div><button class="member-item-del" onclick="deleteMember(${i}, event)">✕</button></div>`).join('');
}

function renderHistory() {
  const c = document.getElementById('history-list');
  if (!history.length) { c.innerHTML = `<div class="empty-state small"><span class="empty-icon">📬</span><p>Aucun envoi pour le moment.</p></div>`; return; }
  c.innerHTML = history.slice().reverse().map(h => `<div class="history-item"><div class="history-avatar">${h.initials}</div><div class="history-info"><div class="history-name">${h.name}</div><div class="history-meta">${h.plans.join(', ')}${h.tips.length ? ' · ' + h.tips.length + ' conseil(s)' : ''}</div></div><span class="history-badge">Envoyé</span><div class="history-date">${h.date}</div></div>`).join('');
}

document.getElementById('member-form').addEventListener('submit', e => {
  e.preventDefault();
  const m = { prenom: document.getElementById('f-prenom').value.trim(), nom: document.getElementById('f-nom').value.trim(), email: document.getElementById('f-email').value.trim(), tel: document.getElementById('f-tel').value.trim(), age: document.getElementById('f-age').value, objectif: document.getElementById('f-objectif').value, regime: document.getElementById('f-regime').value, notes: document.getElementById('f-notes').value.trim(), createdAt: new Date().toLocaleDateString('fr-FR') };
  members.push(m); save(); renderMemberList(); renderDashboard(); e.target.reset();
  showToast(`✓ ${m.prenom} ${m.nom} ajouté(e) avec succès !`);
});

function deleteMember(i, e) { e.stopPropagation(); const m = members[i]; members.splice(i, 1); save(); renderMemberList(); renderDashboard(); showToast(`${m.prenom} ${m.nom} supprimé(e).`); }

function populateSendSelect() {
  const sel = document.getElementById('send-member');
  sel.innerHTML = '<option value="">— Sélectionner un adhérent —</option>';
  members.forEach((m, i) => { const o = document.createElement('option'); o.value = i; o.textContent = `${m.prenom} ${m.nom} — ${m.email}`; sel.appendChild(o); });
}

function selectPlan(plan) {
  openTab('envoyer');
  setTimeout(() => { document.querySelectorAll('#plan-selector input[type="checkbox"]').forEach(cb => { cb.checked = cb.value === plan; }); showToast(`Plan "${PLANS[plan]}" sélectionné.`); }, 100);
}

function buildMessage(idx) {
  const m = members[idx]; if (!m) return '';
  const plans = [...document.querySelectorAll('#plan-selector input:checked')].map(cb => cb.value);
  const tips  = [...document.querySelectorAll('#tip-selector input:checked')].map(cb => cb.value);
  const custom = document.getElementById('send-message').value.trim();
  let msg = `Bonjour ${m.prenom} 👋\n\nJe suis ravi(e) de vous accompagner vers votre objectif : ${OBJECTIF_LABELS[m.objectif] || m.objectif}.\n`;
  if (custom) msg += `\n${custom}\n`;
  if (plans.length) { msg += '\n━━━━━━━━━━━━━━━━━━━━━━\n🍽️  VOTRE PLAN NUTRITION\n━━━━━━━━━━━━━━━━━━━━━━\n'; plans.forEach(p => { msg += '\n' + (PLAN_DETAILS[p] || PLANS[p]) + '\n'; }); }
  if (tips.length) { msg += '\n━━━━━━━━━━━━━━━━━━━━━━\n💡  CONSEILS BIEN-ÊTRE\n━━━━━━━━━━━━━━━━━━━━━━\n'; tips.forEach(t => { const tip = TIPS[t]; if (tip) msg += `\n✦ ${tip.title}\n${tip.text}\n`; }); }
  msg += '\n━━━━━━━━━━━━━━━━━━━━━━\n\nN\'hésitez pas à me contacter pour toute question. Je suis là pour vous accompagner ! 💪\n\nÀ très bientôt,\nVotre coach Sarah ✦';
  return msg;
}

function previewMessage() {
  const idx = document.getElementById('send-member').value;
  if (idx === '') { showToast('Sélectionnez un adhérent d\'abord.'); return; }
  document.getElementById('preview-content').textContent = buildMessage(parseInt(idx, 10));
  document.getElementById('copy-bar').classList.remove('hidden');
}

function sendMessage() {
  const idx = parseInt(document.getElementById('send-member').value, 10);
  if (isNaN(idx)) { showToast('Sélectionnez un adhérent d\'abord.'); return; }
  const m = members[idx];
  const plans = [...document.querySelectorAll('#plan-selector input:checked')].map(cb => cb.value);
  const tips  = [...document.querySelectorAll('#tip-selector input:checked')].map(cb => cb.value);
  if (!plans.length && !tips.length && !document.getElementById('send-message').value.trim()) { showToast('Ajoutez au moins un plan, conseil ou message.'); return; }
  const msg = buildMessage(idx);
  navigator.clipboard.writeText(msg).catch(() => {});
  history.push({ initials: initials(m), name: `${m.prenom} ${m.nom}`, email: m.email, plans: plans.map(p => PLANS[p]), tips, date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) });
  sentCount++; save();
  document.getElementById('preview-content').textContent = msg;
  document.getElementById('copy-bar').classList.remove('hidden');
  renderHistory(); renderDashboard();
  showToast(`✓ Programme copié ! Partagez-le à ${m.prenom} par email ou SMS.`);
}

function copyPreview() {
  navigator.clipboard.writeText(document.getElementById('preview-content').textContent).then(() => { const c = document.getElementById('copy-confirm'); c.classList.remove('hidden'); setTimeout(() => c.classList.add('hidden'), 2000); });
}

function copyTip(btn) {
  const card = btn.closest('.conseil-card');
  navigator.clipboard.writeText(`✦ ${card.querySelector('h4').textContent}\n${card.querySelector('p').textContent}`).then(() => { btn.textContent = '✓ Copié !'; btn.classList.add('copied'); setTimeout(() => { btn.textContent = 'Copier le conseil'; btn.classList.remove('copied'); }, 2000); });
}

function showToast(msg) {
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.add('hidden'), 3200);
}

renderDashboard(); renderMemberList(); renderHistory();