/* ─────────────────────────────────────────────
   CoachVital — App Logic
   ───────────────────────────────────────────── */

// ─── State ───
let members  = JSON.parse(localStorage.getItem('cv_members')  || '[]');
let history  = JSON.parse(localStorage.getItem('cv_history')  || '[]');
let sentCount = parseInt(localStorage.getItem('cv_sent') || '0', 10);

const PLANS = {
  equilibre:   '🥗 Programme Équilibre',
  performance: '💪 Programme Performance',
  detox:       '🌿 Programme Détox',
  perte_poids: '🏃 Programme Perte de Poids',
};

const TIPS = {
  sommeil:     { title: 'Le sommeil, pilier de la performance', text: '7 à 9 heures de sommeil par nuit favorisent la récupération musculaire, réduisent le cortisol et améliorent la concentration. Établissez une routine fixe : même heure de coucher, chambre fraîche à 18°C, pas d\'écran 1h avant.' },
  hydratation: { title: 'L\'eau, votre meilleure alliée', text: 'Une déshydratation de 2% réduit les performances de 20%. Buvez 250ml dès le réveil, puis régulièrement toute la journée. Avant l\'effort : 500ml, pendant : 150ml toutes les 20 min, après : recomposition avec eau et électrolytes.' },
  mental:      { title: 'La pleine conscience au quotidien', text: '5 minutes de méditation par jour suffisent pour réduire le stress et améliorer la relation à votre corps. Pratiquez la respiration 4-7-8 (inspirez 4s, retenez 7s, expirez 8s) pour un calme immédiat.' },
  marche:      { title: 'Marchez, tout simplement', text: '8 000 à 10 000 pas par jour améliorent la santé cardiovasculaire et stabilisent la glycémie. La régularité prime sur l\'intensité.' },
  rythme:      { title: 'Synchronisez-vous avec votre horloge biologique', text: 'Exposez-vous à la lumière naturelle dans l\'heure suivant le réveil. Évitez les repas lourds après 20h et planifiez vos efforts intenses en fin de matinée.' },
  motivation:  { title: 'Fixez des objectifs SMART', text: 'Un objectif Spécifique, Mesurable, Atteignable, Réaliste et Temporel est 3× plus souvent atteint. Célébrez chaque petite victoire.' },
};

const PLAN_DETAILS = {
  equilibre: `🥗 PROGRAMME ÉQUILIBRE — Rééquilibrage alimentaire doux

Matin   : Porridge avoine + fruits frais + thé vert
Midi    : Protéines maigres + légumes vapeur + féculents (riz, quinoa)
Collation: Fruits secs + yaourt nature
Soir    : Soupe légumes + œufs ou poisson + salade verte

Règles d'or :
  • 💧 2L d'eau par jour
  • ⏰ Prenez le temps de manger lentement
  • 🚫 Limitez les sucres raffinés`,

  performance: `💪 PROGRAMME PERFORMANCE — Prise de masse et énergie

Matin      : Omelette 3 œufs + pain complet + banane
Pré-séance : Banane + amandes (30 min avant)
Midi       : 200g poulet/saumon + riz complet + brocolis
Post-séance: Protéines + glucides rapides
Soir       : Viande/poisson maigre + légumes + patate douce

Règles d'or :
  • 💧 3L d'eau par jour
  • 🥩 1.8g de protéines par kg de poids corporel
  • ⚡ 5 repas répartis dans la journée`,

  detox: `🌿 PROGRAMME DÉTOX — Légèreté et revitalisation

Matin    : Eau citronnée + smoothie vert + graines de chia
Midi     : Grande salade composée + légumineuses + avocat
Collation: Tisane détox + poignée de noix
Soir     : Bouillon de légumes + crudités + houmous

Règles d'or :
  • 🍋 Eau citronnée tiède chaque matin à jeun
  • 🥦 80% d'alimentation végétale
  • 🚫 Alcool et café limités`,

  perte_poids: `🏃 PROGRAMME PERTE DE POIDS — Déficit calorique sain et durable

Matin    : Yaourt grec + baies + 1 tranche pain complet
Midi     : Protéines maigres + légumes à volonté + peu de féculents
Collation: Fruit + fromage blanc 0%
Soir     : Omelette légumes ou poisson vapeur + salade

Règles d'or :
  • 📉 Déficit de -300 kcal/jour (progressif et durable)
  • 🕕 Jeûne nocturne de 12h minimum
  • 🥗 Assiette composée à 50% de légumes`,
};

const OBJECTIF_LABELS = {
  perte_poids: 'Perte de poids', prise_masse: 'Prise de masse',
  endurance: 'Endurance', bien_etre: 'Bien-être', flexibilite: 'Flexibilité',
  nutrition: 'Rééquilibrage alimentaire',
};

// ─── Save helpers ───
function save() {
  localStorage.setItem('cv_members', JSON.stringify(members));
  localStorage.setItem('cv_history', JSON.stringify(history));
  localStorage.setItem('cv_sent', String(sentCount));
}

// ─── Tab navigation ───
function openTab(name) {
  document.querySelectorAll('.nav-btn, .bottom-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-section').forEach(s => s.classList.toggle('active', s.id === 'tab-' + name));
  document.getElementById('hero').style.display = name === 'dashboard' ? '' : 'none';
  if (name === 'envoyer') populateSendSelect();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-btn, .bottom-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => openTab(btn.dataset.tab));
});

// ─── Render helpers ───
function initials(m) {
  return (m.prenom[0] + m.nom[0]).toUpperCase();
}

function renderDashboard() {
  document.getElementById('dash-count').textContent = members.length;
  document.getElementById('dash-sent').textContent   = sentCount;
  document.getElementById('dash-goals').textContent  = members.filter(m => m.objectif).length;
  document.getElementById('stat-members').querySelector('.stat-num').textContent = members.length;
  document.getElementById('stat-sent').textContent = sentCount;

  const container = document.getElementById('recent-list');
  if (!members.length) {
    container.innerHTML = `<div class="empty-state"><span class="empty-icon">🌿</span><p>Aucun adhérent pour le moment.</p><button class="btn-secondary" onclick="openTab('members')">Ajouter un adhérent</button></div>`;
    return;
  }
  container.innerHTML = members.slice(-6).reverse().map(m => `
    <div class="member-card" onclick="openTab('members')">
      <div class="member-card-avatar">${initials(m)}</div>
      <div class="member-card-name">${m.prenom} ${m.nom}</div>
      <div class="member-card-email">${m.email}</div>
      <span class="member-card-tag">${OBJECTIF_LABELS[m.objectif] || m.objectif}</span>
    </div>`).join('');
}

function renderMemberList() {
  const badge = document.getElementById('member-badge');
  badge.textContent = members.length;

  const container = document.getElementById('member-list');
  if (!members.length) {
    container.innerHTML = `<div class="empty-state small"><span class="empty-icon">🌿</span><p>Ajoutez votre premier adhérent.</p></div>`;
    return;
  }
  container.innerHTML = members.map((m, i) => `
    <div class="member-item">
      <div class="member-item-avatar">${initials(m)}</div>
      <div class="member-item-info">
        <div class="member-item-name">${m.prenom} ${m.nom}</div>
        <div class="member-item-email">${m.email}</div>
      </div>
      <button class="member-item-del" onclick="deleteMember(${i}, event)" title="Supprimer">✕</button>
    </div>`).join('');
}

function renderHistory() {
  const container = document.getElementById('history-list');
  if (!history.length) {
    container.innerHTML = `<div class="empty-state small"><span class="empty-icon">📬</span><p>Aucun envoi pour le moment.</p></div>`;
    return;
  }
  container.innerHTML = history.slice().reverse().map(h => `
    <div class="history-item">
      <div class="history-avatar">${h.initials}</div>
      <div class="history-info">
        <div class="history-name">${h.name}</div>
        <div class="history-meta">${h.plans.join(', ')} ${h.tips.length ? '· ' + h.tips.length + ' conseil(s)' : ''}</div>
      </div>
      <span class="history-badge">Envoyé</span>
      <div class="history-date">${h.date}</div>
    </div>`).join('');
}

// ─── Add member ───
document.getElementById('member-form').addEventListener('submit', e => {
  e.preventDefault();
  const m = {
    prenom:    document.getElementById('f-prenom').value.trim(),
    nom:       document.getElementById('f-nom').value.trim(),
    email:     document.getElementById('f-email').value.trim(),
    tel:       document.getElementById('f-tel').value.trim(),
    age:       document.getElementById('f-age').value,
    objectif:  document.getElementById('f-objectif').value,
    regime:    document.getElementById('f-regime').value,
    notes:     document.getElementById('f-notes').value.trim(),
    createdAt: new Date().toLocaleDateString('fr-FR'),
  };
  members.push(m);
  save();
  renderMemberList();
  renderDashboard();
  e.target.reset();
  showToast(`✓ ${m.prenom} ${m.nom} ajouté(e) avec succès !`);
});

// ─── Delete member ───
function deleteMember(index, event) {
  event.stopPropagation();
  const m = members[index];
  members.splice(index, 1);
  save();
  renderMemberList();
  renderDashboard();
  showToast(`${m.prenom} ${m.nom} supprimé(e).`);
}

// ─── Populate send select ───
function populateSendSelect() {
  const sel = document.getElementById('send-member');
  sel.innerHTML = '<option value="">— Sélectionner un adhérent —</option>';
  members.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${m.prenom} ${m.nom} — ${m.email}`;
    sel.appendChild(opt);
  });
}

// ─── Select plan shortcut (from nutrition tab) ───
function selectPlan(plan) {
  openTab('envoyer');
  setTimeout(() => {
    document.querySelectorAll('#plan-selector input[type="checkbox"]').forEach(cb => {
      cb.checked = cb.value === plan;
    });
    showToast(`Plan "${PLANS[plan]}" sélectionné.`);
  }, 100);
}

// ─── Build message ───
function buildMessage(memberIdx) {
  const m = members[memberIdx];
  if (!m) return '';

  const selectedPlans = [...document.querySelectorAll('#plan-selector input:checked')].map(cb => cb.value);
  const selectedTips  = [...document.querySelectorAll('#tip-selector input:checked')].map(cb => cb.value);
  const customMsg     = document.getElementById('send-message').value.trim();

  let msg = '';
  msg += `Bonjour ${m.prenom} 👋\n\n`;
  msg += `Je suis ravi(e) de vous accompagner vers votre objectif : ${OBJECTIF_LABELS[m.objectif] || m.objectif}.\n`;
  if (customMsg) msg += `\n${customMsg}\n`;

  if (selectedPlans.length) {
    msg += '\n━━━━━━━━━━━━━━━━━━━━━━\n🍽️  VOTRE PLAN NUTRITION\n━━━━━━━━━━━━━━━━━━━━━━\n';
    selectedPlans.forEach(p => {
      msg += '\n' + (PLAN_DETAILS[p] || PLANS[p]) + '\n';
    });
  }

  if (selectedTips.length) {
    msg += '\n━━━━━━━━━━━━━━━━━━━━━━\n💡  CONSEILS BIEN-ÊTRE\n━━━━━━━━━━━━━━━━━━━━━━\n';
    selectedTips.forEach(t => {
      const tip = TIPS[t];
      if (tip) msg += `\n✦ ${tip.title}\n${tip.text}\n`;
    });
  }

  msg += '\n━━━━━━━━━━━━━━━━━━━━━━\n';
  msg += '\nN\'hésitez pas à me contacter pour toute question. Je suis là pour vous accompagner ! 💪\n\n';
  msg += 'À très bientôt,\nVotre coach Sarah ✦';

  return msg;
}

// ─── Preview ───
function previewMessage() {
  const idx = document.getElementById('send-member').value;
  if (idx === '') { showToast('Sélectionnez un adhérent d\'abord.'); return; }

  const msg = buildMessage(parseInt(idx, 10));
  const content = document.getElementById('preview-content');
  content.textContent = msg;
  document.getElementById('copy-bar').classList.remove('hidden');
}

// ─── Send message ───
function sendMessage() {
  const idx = parseInt(document.getElementById('send-member').value, 10);
  if (isNaN(idx)) { showToast('Sélectionnez un adhérent d\'abord.'); return; }

  const m = members[idx];
  const selectedPlans = [...document.querySelectorAll('#plan-selector input:checked')].map(cb => cb.value);
  const selectedTips  = [...document.querySelectorAll('#tip-selector input:checked')].map(cb => cb.value);

  if (!selectedPlans.length && !selectedTips.length && !document.getElementById('send-message').value.trim()) {
    showToast('Ajoutez au moins un plan, conseil ou message.');
    return;
  }

  // Build message and copy to clipboard
  const msg = buildMessage(idx);
  navigator.clipboard.writeText(msg).catch(() => {});

  // Log to history
  const planLabels = selectedPlans.map(p => PLANS[p]);
  history.push({
    initials: initials(m),
    name: `${m.prenom} ${m.nom}`,
    email: m.email,
    plans: planLabels,
    tips: selectedTips,
    date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
  });
  sentCount++;
  save();

  // Update preview
  document.getElementById('preview-content').textContent = msg;
  document.getElementById('copy-bar').classList.remove('hidden');

  renderHistory();
  renderDashboard();
  showToast(`✓ Programme copié ! Partagez-le à ${m.prenom} par email ou SMS.`);
}

// ─── Copy preview ───
function copyPreview() {
  const text = document.getElementById('preview-content').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const conf = document.getElementById('copy-confirm');
    conf.classList.remove('hidden');
    setTimeout(() => conf.classList.add('hidden'), 2000);
  });
}

// ─── Copy tip ───
function copyTip(btn) {
  const card = btn.closest('.conseil-card');
  const title = card.querySelector('h4').textContent;
  const text  = card.querySelector('p').textContent;
  navigator.clipboard.writeText(`✦ ${title}\n${text}`).then(() => {
    btn.textContent = '✓ Copié !';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copier le conseil'; btn.classList.remove('copied'); }, 2000);
  });
}

// ─── Toast ───
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), 3200);
}

// ─── Init ───
renderDashboard();
renderMemberList();
renderHistory();
