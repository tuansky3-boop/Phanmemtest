/* Ôn thi C1 – ứng dụng một trang, không cần build. */
(function () {
  'use strict';

  // ================= Cấu hình kỳ thi =================
  const EXAM = {
    total: 35,        // số câu
    minutes: 22,      // thời gian
    pass: 32,         // số câu đúng tối thiểu
    // Phân bổ câu hỏi theo chương (tham khảo) – tổng = 35
    plan: { 1: 9, 2: 1, 3: 2, 4: 2, 5: 1, 6: 10, 7: 10 },
  };

  // ================= Tiện ích =================
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const KEYS = ['A', 'B', 'C', 'D', 'E'];
  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const fmtDate = (t) => new Date(t).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const vibrate = (p) => { try { state.settings.haptics && navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

  // ================= Lưu trữ =================
  const STORE_KEY = 'c1:state';
  const BANK_KEY = 'c1:bank';
  const EXAM_KEY = 'c1:exam';
  const defaults = () => ({
    answers: {},        // qid -> { last, ok, n, wrong }
    flags: {},          // qid -> true
    exams: [],          // lịch sử thi
    settings: { theme: 'auto', fontScale: 1, autoNext: false, haptics: true, shuffleAns: false },
  });
  const load = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch (e) { return fb; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let state = Object.assign(defaults(), load(STORE_KEY, {}));
  state.settings = Object.assign(defaults().settings, state.settings);
  const persist = () => save(STORE_KEY, state);

  let BANK = [];
  function loadBank() {
    const custom = load(BANK_KEY, null);
    BANK = Array.isArray(custom) && custom.length ? custom : window.QUESTIONS_DEFAULT;
    BANK.forEach((q, i) => { if (q.id == null) q.id = i + 1; });
  }
  loadBank();
  const qById = (id) => BANK.find((q) => q.id === id);
  const usingCustomBank = () => BANK !== window.QUESTIONS_DEFAULT;

  // ================= Thống kê =================
  function stats(list = BANK) {
    let done = 0, ok = 0, bad = 0;
    for (const q of list) { const a = state.answers[q.id]; if (a) { done++; a.ok ? ok++ : bad++; } }
    return { total: list.length, done, ok, bad, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
  }
  const SETS = {
    all: { name: 'Tất cả câu hỏi', icon: '📚', filter: () => BANK },
    critical: { name: 'Câu điểm liệt', icon: '⚠️', filter: () => BANK.filter((q) => q.dl) },
    wrong: { name: 'Câu hay sai', icon: '❌', filter: () => BANK.filter((q) => state.answers[q.id] && (state.answers[q.id].wrong > 0 && !state.answers[q.id].ok)) },
    flagged: { name: 'Câu đã đánh dấu', icon: '⭐', filter: () => BANK.filter((q) => state.flags[q.id]) },
    new: { name: 'Câu chưa làm', icon: '🆕', filter: () => BANK.filter((q) => !state.answers[q.id]) },
  };
  function getSet(key) {
    if (key.startsWith('ch')) {
      const id = +key.slice(2); const ch = CHAPTERS.find((c) => c.id === id);
      return { name: ch ? `Chương ${id}: ${ch.name}` : 'Chương', icon: ch?.icon || '📘', list: BANK.filter((q) => q.ch === id) };
    }
    const s = SETS[key] || SETS.all;
    return { name: s.name, icon: s.icon, list: s.filter() };
  }

  // ================= Điều hướng =================
  const NAV = [
    { href: '#/', key: 'home', ico: '🏠', label: 'Trang chủ' },
    { href: '#/study', key: 'study', ico: '📖', label: 'Ôn tập' },
    { href: '#/exam', key: 'exam', ico: '📝', label: 'Thi thử' },
    { href: '#/signs', key: 'signs', ico: '🚸', label: 'Biển báo' },
    { href: '#/more', key: 'more', ico: '☰', label: 'Thêm' },
  ];
  const SIDE_NAV = [
    ...NAV.slice(0, 4),
    { href: '#/tips', key: 'tips', ico: '💡', label: 'Mẹo ghi nhớ' },
    { href: '#/stats', key: 'stats', ico: '📊', label: 'Thống kê' },
    { href: '#/settings', key: 'settings', ico: '⚙️', label: 'Cài đặt' },
  ];
  function renderNav(active) {
    $('#bottomNav').innerHTML = NAV.map((n) =>
      `<a href="${n.href}" class="${n.key === active || (n.key === 'more' && ['tips', 'stats', 'settings'].includes(active)) ? 'active' : ''}" ${n.key === active ? 'aria-current="page"' : ''}><span class="ico" aria-hidden="true">${n.ico}</span>${n.label}</a>`).join('');
    $('#sideNav').innerHTML = SIDE_NAV.map((n) =>
      `<a href="${n.href}" class="${n.key === active ? 'active' : ''}" ${n.key === active ? 'aria-current="page"' : ''}><span class="ico" aria-hidden="true">${n.ico}</span>${n.label}</a>`).join('') +
      `<div class="kbd-hint"><b>Phím tắt khi làm bài</b><br><span class="kbd">1</span>–<span class="kbd">4</span> chọn đáp án · <span class="kbd">←</span><span class="kbd">→</span> chuyển câu · <span class="kbd">F</span> đánh dấu</div>`;
  }
  function setTop(title, { back = null, actions = '' } = {}) {
    $('#topTitle').textContent = title;
    document.title = `${title} · Ôn thi C1`;
    const b = $('#backBtn');
    b.hidden = !back;
    b.onclick = back ? () => (typeof back === 'function' ? back() : (location.hash = back)) : null;
    $('#topActions').innerHTML = actions;
  }

  let cleanup = null;
  function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    closeSheet();
    document.body.classList.remove('in-quiz');
    const h = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    const params = new URLSearchParams(qs || '');
    const main = $('#main');
    main.scrollTop = 0; window.scrollTo(0, 0);
    const v = parts[0] || 'home';
    renderNav(v === 'practice' ? 'study' : v);
    const views = { home: viewHome, study: viewStudy, practice: () => viewPractice(parts[1] || 'all', params), exam: () => viewExam(parts[1], params), signs: viewSigns, tips: viewTips, stats: viewStats, settings: viewSettings, more: viewMore };
    (views[v] || viewHome)(main);
    main.focus({ preventScroll: true });
  }

  // ================= TRANG CHỦ =================
  function viewHome(main) {
    setTop('Ôn thi bằng lái C1', { actions: themeBtn() });
    const s = stats();
    const crit = stats(BANK.filter((q) => q.dl));
    const last = state.exams[state.exams.length - 1];
    const passed = state.exams.filter((e) => e.passed).length;
    const acc = s.done ? Math.round((s.ok / s.done) * 100) : 0;
    const pendingExam = load(EXAM_KEY, null);

    main.innerHTML = `
      <section class="card hero">
        <div class="hero-inner">
          <div>
            <span class="chip" style="background:rgba(255,255,255,.18);color:#fff;border-color:transparent">🚚 Hạng C1 · Xe tải 3,5 – 7,5 tấn</span>
            <h2 style="margin-top:12px">${s.done ? 'Tiếp tục hành trình ôn thi!' : 'Bắt đầu ôn thi lý thuyết C1'}</h2>
            <p>${s.done ? `Bạn đã làm ${s.done}/${s.total} câu, đúng ${acc}%.` : `${s.total} câu hỏi · Thi thử ${EXAM.total} câu trong ${EXAM.minutes} phút.`}</p>
            <div class="actions">
              ${pendingExam ? `<a class="btn lg" href="#/exam/run">⏱ Tiếp tục bài thi</a>` : `<a class="btn lg" href="#/practice/${s.done < s.total ? 'new' : 'all'}">▶ ${s.done ? 'Học tiếp' : 'Bắt đầu học'}</a>`}
              <a class="btn lg ghost" href="#/exam">📝 Thi thử</a>
            </div>
          </div>
          <div class="ring" style="--p:${s.pct}" role="img" aria-label="Tiến độ ${s.pct}%"><div><span><b>${s.pct}%</b><small>đã ôn</small></span></div></div>
        </div>
      </section>

      <section class="section grid cols-2 lg-cols-4">
        <div class="card stat"><div class="ico">✅</div><div><b>${s.ok}</b><span>Câu trả lời đúng</span></div></div>
        <div class="card stat"><div class="ico">❌</div><div><b>${s.bad}</b><span>Câu đang sai</span></div></div>
        <div class="card stat"><div class="ico">⚠️</div><div><b>${crit.ok}/${crit.total}</b><span>Điểm liệt đã thuộc</span></div></div>
        <div class="card stat"><div class="ico">🏆</div><div><b>${passed}/${state.exams.length}</b><span>Bài thi đạt</span></div></div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Luyện tập nhanh</h2><a href="#/study">Xem tất cả →</a></div>
        <div class="grid cols-2 lg-cols-4">
          ${modeCard('critical', 'red')}${modeCard('wrong')}${modeCard('flagged')}${modeCard('new')}
        </div>
      </section>

      <section class="section grid lg-cols-3" style="align-items:start">
        <div class="card pad" style="grid-column: span 1">
          <h2 style="font-size:1.05rem;margin-bottom:12px">📋 Cấu trúc bài thi C1</h2>
          <div class="list">
            ${infoRow('📝', 'Số câu hỏi', `${EXAM.total} câu`)}
            ${infoRow('⏱', 'Thời gian', `${EXAM.minutes} phút`)}
            ${infoRow('🎯', 'Điểm đạt', `≥ ${EXAM.pass}/${EXAM.total} câu`)}
            ${infoRow('⚠️', 'Câu điểm liệt', 'Sai là trượt')}
          </div>
        </div>
        <div class="card" style="grid-column: span ${window.innerWidth >= 1024 ? 2 : 1}">
          <div class="section-head" style="padding:16px 16px 0"><h2 style="font-size:1.05rem">📈 Tiến độ theo chương</h2></div>
          <div class="list">${CHAPTERS.map(chapterRow).join('')}</div>
        </div>
      </section>

      ${last ? `<section class="section"><div class="section-head"><h2>Bài thi gần nhất</h2><a href="#/stats">Lịch sử →</a></div>
        <div class="card list">${examRow(last)}</div></section>` : ''}
    `;
  }
  const infoRow = (ico, t, v) => `<div class="list-item" style="padding:10px 0;min-height:auto"><div class="ico" style="width:36px;height:36px;font-size:1rem">${ico}</div><div class="body"><div class="sub">${t}</div></div><b>${v}</b></div>`;
  function modeCard(key, cls = '') {
    const s = getSet(key);
    return `<a class="mode-card ${cls}" href="#/practice/${key}"><span class="ico" aria-hidden="true">${s.icon}</span><b>${s.name}</b><span class="count">${s.list.length} câu</span></a>`;
  }
  function chapterRow(ch) {
    const list = BANK.filter((q) => q.ch === ch.id);
    const s = stats(list);
    const okW = s.total ? (s.ok / s.total) * 100 : 0, badW = s.total ? (s.bad / s.total) * 100 : 0;
    return `<a class="list-item" href="#/practice/ch${ch.id}">
      <div class="ico" aria-hidden="true">${ch.icon}</div>
      <div class="body"><div class="title">Chương ${ch.id}. ${esc(ch.name)}</div>
        <div class="sub">${s.done}/${s.total} câu · đúng ${s.ok}</div>
        <div class="progress split" aria-hidden="true"><i class="ok" style="width:${okW}%"></i><i class="bad" style="width:${badW}%"></i></div>
      </div><span class="chev" aria-hidden="true">›</span></a>`;
  }
  function examRow(e) {
    return `<div class="list-item"><div class="ico">${e.passed ? '🎉' : '😓'}</div>
      <div class="body"><div class="title">${e.score}/${e.total} câu đúng ${e.critFail ? '<span class="chip red">Sai điểm liệt</span>' : ''}</div>
      <div class="sub">${fmtDate(e.at)} · ${fmtTime(e.used)} phút</div></div>
      <span class="chip ${e.passed ? 'green' : 'red'}">${e.passed ? 'ĐẠT' : 'TRƯỢT'}</span></div>`;
  }

  // ================= ÔN TẬP =================
  function viewStudy(main) {
    setTop('Ôn tập', { actions: themeBtn() });
    main.innerHTML = `
      <div class="page-head"><h2 class="desk">Ôn tập theo chủ đề</h2><p>Chọn chế độ hoặc chương để luyện. Đáp án và giải thích hiện ngay sau khi chọn.</p></div>
      <div class="grid cols-2 lg-cols-4">${['all', 'critical', 'wrong', 'flagged', 'new'].map((k) => modeCard(k, k === 'critical' ? 'red' : '')).join('')}
        <a class="mode-card" href="#/practice/all?random=1"><span class="ico">🔀</span><b>Ngẫu nhiên</b><span class="count">${BANK.length} câu</span></a>
      </div>
      <section class="section"><div class="section-head"><h2>Theo chương</h2></div>
        <div class="card list">${CHAPTERS.map(chapterRow).join('')}</div></section>`;
  }

  // ================= QUIZ ENGINE (dùng cho cả ôn tập & thi) =================
  function Quiz({ main, list, mode, title, exam, onFinish, startIndex = 0, setKey }) {
    // mode: 'practice' | 'exam' | 'review'
    let idx = Math.min(startIndex, Math.max(0, list.length - 1));
    const examAns = exam ? exam.answers : null;
    let tickId = null;
    document.body.classList.add('in-quiz');

    const ansOrder = {}; // shuffle answers per question (practice only, optional)
    const orderFor = (q) => {
      if (!ansOrder[q.id]) ansOrder[q.id] = state.settings.shuffleAns && mode === 'practice' ? shuffle(q.a.map((_, i) => i)) : q.a.map((_, i) => i);
      return ansOrder[q.id];
    };

    function chosen(q) {
      if (mode === 'exam') return examAns[q.id];
      if (mode === 'review') return exam.answers[q.id];
      return sessionAns[q.id];
    }
    const sessionAns = {};

    function statusOf(q) {
      const c = chosen(q);
      if (c == null) return '';
      if (mode === 'exam') return 'answered';
      return c === q.c ? 'ok' : 'bad';
    }

    function media(q) {
      if (q.sign && window.signById(q.sign)) return `<div class="qmedia sign">${window.signById(q.sign).svg}</div>`;
      if (q.scene) return `<div class="qmedia scene">${window.renderScene(q.scene)}</div>`;
      if (q.img) return `<div class="qmedia"><img src="${esc(q.img)}" alt="Hình minh hoạ câu hỏi" loading="lazy"></div>`;
      return '';
    }

    function render() {
      const q = list[idx];
      if (!q) { main.innerHTML = `<div class="empty card"><div class="ico">🎉</div><p>Không có câu hỏi nào trong mục này.</p><a class="btn" href="#/study">Quay lại ôn tập</a></div>`; document.body.classList.remove('in-quiz'); return; }
      const c = chosen(q);
      const reveal = mode !== 'exam' && c != null;
      const flagged = !!state.flags[q.id];
      const ch = CHAPTERS.find((x) => x.id === q.ch);
      const doneCount = list.filter((x) => chosen(x) != null).length;

      setTop(title, {
        back: () => leave(),
        actions: `${mode === 'exam' ? `<span class="timer" id="timer" aria-live="off">--:--</span>` : ''}
          <button class="icon-btn ${flagged ? 'active' : ''}" id="flagBtn" aria-pressed="${flagged}" aria-label="Đánh dấu câu hỏi" title="Đánh dấu (F)">
            <svg viewBox="0 0 24 24"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg></button>`,
      });

      main.innerHTML = `
        <div class="quiz">
          <div>
            <div class="card pad" id="qcard">
              <div class="progress qprogress" aria-hidden="true"><i style="width:${((idx + 1) / list.length) * 100}%"></i></div>
              <div class="qhead">
                <span class="qno">Câu ${idx + 1}/${list.length}</span>
                ${ch ? `<span class="chip">${ch.icon} ${esc(ch.short)}</span>` : ''}
                ${q.dl ? '<span class="chip red">⚠️ Điểm liệt</span>' : ''}
                <span class="spacer"></span>
                ${mode === 'exam' ? `<span class="chip blue">${doneCount}/${list.length} đã làm</span>` : ''}
              </div>
              <h2 class="qtext">${esc(q.q)}</h2>
              ${media(q)}
              <div class="answers" role="radiogroup" aria-label="Các đáp án">
                ${orderFor(q).map((ai, k) => {
                  let cls = '';
                  if (reveal) { if (ai === q.c) cls = 'correct'; else if (ai === c) cls = 'wrong'; }
                  else if (ai === c) cls = 'selected';
                  return `<button class="ans ${cls}" role="radio" aria-checked="${ai === c}" data-ai="${ai}" ${reveal ? 'disabled' : ''}>
                    <span class="key">${KEYS[k]}</span><span class="txt">${esc(q.a[ai])}</span></button>`;
                }).join('')}
              </div>
              ${reveal ? `<div class="explain ${c === q.c ? 'ok' : 'bad'}"><b>${c === q.c ? '✅ Chính xác!' : `❌ Chưa đúng — đáp án đúng: ${KEYS[orderFor(q).indexOf(q.c)]}`}</b>${esc(q.exp || '')}</div>` : ''}
              <div class="swipe-hint">Vuốt trái/phải để chuyển câu</div>
            </div>
            <div class="quiz-bar">
              <button class="btn ghost nav" id="prevBtn" aria-label="Câu trước" ${idx === 0 ? 'disabled' : ''}>‹</button>
              <button class="btn ghost grid-toggle" id="gridBtn" aria-label="Danh sách câu hỏi">☷ ${idx + 1}/${list.length}</button>
              ${mode === 'exam'
                ? (idx === list.length - 1 ? `<button class="btn danger" id="submitBtn">Nộp bài</button>` : `<button class="btn" id="nextBtn">Câu tiếp ›</button>`)
                : (idx === list.length - 1 ? `<button class="btn success" id="doneBtn">${mode === 'review' ? 'Xong' : 'Hoàn thành'}</button>` : `<button class="btn" id="nextBtn">Câu tiếp ›</button>`)}
            </div>
          </div>
          <aside class="qpanel card pad" aria-label="Danh sách câu hỏi">${panelHTML()}</aside>
        </div>`;
      bind();
      if (mode === 'exam') tick();
    }

    function panelHTML() {
      return `<div class="row" style="margin-bottom:12px"><b>Danh sách câu</b><span class="spacer"></span>
          ${mode === 'exam' ? `<button class="btn sm danger" data-submit>Nộp bài</button>` : ''}</div>
        <div class="qgrid">${list.map((q, i) => `<button data-go="${i}" class="${statusOf(q)} ${i === idx ? 'current' : ''} ${state.flags[q.id] ? 'flag' : ''} ${q.dl ? 'dl' : ''}" aria-label="Câu ${i + 1}">${i + 1}</button>`).join('')}</div>
        <div class="legend">
          ${mode === 'exam' ? `<span><i style="background:var(--primary-soft)"></i>Đã làm</span>` : `<span><i style="background:var(--success-soft)"></i>Đúng</span><span><i style="background:var(--danger-soft)"></i>Sai</span>`}
          <span><i style="background:var(--surface)"></i>Chưa làm</span><span><i style="background:var(--warn);border-radius:50%"></i>Đánh dấu</span>
        </div>`;
    }

    function choose(ai) {
      const q = list[idx];
      if (mode === 'review') return;
      if (mode === 'practice' && sessionAns[q.id] != null) return;
      if (mode === 'exam') {
        examAns[q.id] = ai; save(EXAM_KEY, exam);
        vibrate(8);
        render();
        if (state.settings.autoNext && idx < list.length - 1) setTimeout(() => go(idx + 1), 250);
        return;
      }
      sessionAns[q.id] = ai;
      const ok = ai === q.c;
      const rec = state.answers[q.id] || { n: 0, wrong: 0 };
      rec.last = ai; rec.ok = ok; rec.n++; if (!ok) rec.wrong++;
      state.answers[q.id] = rec; persist();
      vibrate(ok ? 10 : [30, 40, 30]);
      render();
      const ex = $('.explain', main);
      if (ex && window.innerWidth < 1024) ex.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (ok && state.settings.autoNext && idx < list.length - 1) setTimeout(() => go(idx + 1), 900);
    }

    function go(i) {
      if (i < 0 || i >= list.length) return;
      idx = i; render(); closeSheet();
      if (setKey) save('c1:pos:' + setKey, idx);
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    function toggleFlag() {
      const q = list[idx];
      if (state.flags[q.id]) delete state.flags[q.id]; else state.flags[q.id] = true;
      persist(); toast(state.flags[q.id] ? '⭐ Đã đánh dấu câu hỏi' : 'Đã bỏ đánh dấu');
      render();
    }

    function bind() {
      $$('.ans', main).forEach((b) => b.addEventListener('click', () => choose(+b.dataset.ai)));
      $('#prevBtn', main)?.addEventListener('click', () => go(idx - 1));
      $('#nextBtn', main)?.addEventListener('click', () => go(idx + 1));
      $('#doneBtn', main)?.addEventListener('click', finishPractice);
      $('#submitBtn', main)?.addEventListener('click', confirmSubmit);
      $$('[data-submit]', main).forEach((b) => b.addEventListener('click', confirmSubmit));
      $('#gridBtn', main)?.addEventListener('click', () => openSheet(`<h3>Danh sách câu hỏi</h3>${panelHTML()}`, (el) => {
        $$('[data-go]', el).forEach((b) => b.addEventListener('click', () => go(+b.dataset.go)));
        $$('[data-submit]', el).forEach((b) => b.addEventListener('click', () => { closeSheet(); confirmSubmit(); }));
      }));
      $$('.qpanel [data-go]', main).forEach((b) => b.addEventListener('click', () => go(+b.dataset.go)));
      $('#flagBtn')?.addEventListener('click', toggleFlag);
    }

    // Phím tắt
    function onKey(e) {
      if (e.target.matches('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!$('#sheet').hidden) { if (e.key === 'Escape') closeSheet(); return; }
      const k = e.key.toLowerCase();
      const q = list[idx];
      const n = '12345'.indexOf(k) >= 0 ? '12345'.indexOf(k) : 'abcde'.indexOf(k);
      if (n >= 0 && q && n < q.a.length) { e.preventDefault(); choose(orderFor(q)[n]); }
      else if (k === 'arrowright' || k === 'enter') { e.preventDefault(); if (idx < list.length - 1) go(idx + 1); else if (mode === 'exam') confirmSubmit(); }
      else if (k === 'arrowleft') { e.preventDefault(); go(idx - 1); }
      else if (k === 'f') toggleFlag();
    }
    // Vuốt (mobile)
    let sx = 0, sy = 0, st = 0;
    const onTS = (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); };
    const onTE = (e) => {
      if (!$('#sheet').hidden) return;
      const t = e.changedTouches[0]; const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - st < 600) go(dx < 0 ? idx + 1 : idx - 1);
    };
    document.addEventListener('keydown', onKey);
    main.addEventListener('touchstart', onTS, { passive: true });
    main.addEventListener('touchend', onTE, { passive: true });

    // Timer
    function tick() {
      const el = $('#timer');
      const left = Math.max(0, Math.round((exam.endAt - Date.now()) / 1000));
      if (el) { el.textContent = fmtTime(left); el.classList.toggle('low', left <= 120); el.setAttribute('aria-label', `Còn ${Math.floor(left / 60)} phút`); }
      if (left <= 0) { submit(true); return; }
    }
    if (mode === 'exam') tickId = setInterval(tick, 1000);

    function confirmSubmit() {
      const un = list.filter((q) => examAns[q.id] == null).length;
      openSheet(`<h3>Nộp bài thi?</h3>
        <p>${un ? `Bạn còn <b style="color:var(--danger)">${un} câu chưa làm</b>. ` : 'Bạn đã làm hết các câu. '}Sau khi nộp sẽ không thể sửa đáp án.</p>
        <div class="sheet-actions"><button class="btn ghost" data-close>Làm tiếp</button><button class="btn danger" id="okSubmit">Nộp bài</button></div>`,
        (el) => { $('#okSubmit', el).onclick = () => { closeSheet(); submit(false); }; });
    }
    function submit(timeUp) {
      clearInterval(tickId);
      onFinish && onFinish({ timeUp });
    }

    function finishPractice() {
      const done = list.filter((q) => sessionAns[q.id] != null);
      const ok = done.filter((q) => sessionAns[q.id] === q.c).length;
      if (mode === 'review') { leave(true); return; }
      openSheet(`<h3>🎉 Hoàn thành!</h3>
        <p>Bạn đã làm <b>${done.length}</b> câu trong phiên này, đúng <b style="color:var(--success)">${ok}</b>, sai <b style="color:var(--danger)">${done.length - ok}</b>.</p>
        <div class="sheet-actions"><a class="btn ghost" href="#/study">Về ôn tập</a>${done.length - ok ? `<a class="btn" href="#/practice/wrong">Ôn câu sai</a>` : `<a class="btn" href="#/exam">Thi thử</a>`}</div>`);
    }

    function leave(force) {
      if (mode === 'exam' && !force) {
        openSheet(`<h3>Tạm rời bài thi?</h3><p>Đồng hồ vẫn tiếp tục chạy. Bạn có thể quay lại tiếp tục từ trang chủ hoặc mục Thi thử.</p>
          <div class="sheet-actions"><button class="btn ghost" data-close>Ở lại</button><a class="btn" href="#/exam">Rời khỏi</a></div>`);
        return;
      }
      location.hash = mode === 'review' ? '#/exam' : '#/study';
    }

    render();
    return () => {
      clearInterval(tickId);
      document.removeEventListener('keydown', onKey);
      main.removeEventListener('touchstart', onTS);
      main.removeEventListener('touchend', onTE);
    };
  }

  function viewPractice(key, params) {
    const s = getSet(key);
    let list = s.list;
    const rnd = params.get('random') === '1';
    if (rnd) list = shuffle(list);
    const pos = rnd ? 0 : load('c1:pos:' + key, 0) || 0;
    cleanup = Quiz({ main: $('#main'), list, mode: 'practice', title: s.name, startIndex: pos < list.length ? pos : 0, setKey: rnd ? null : key });
  }

  // ================= THI THỬ =================
  function buildExam() {
    const picked = [];
    const used = new Set();
    for (const [ch, n] of Object.entries(EXAM.plan)) {
      const pool = shuffle(BANK.filter((q) => q.ch === +ch));
      pool.slice(0, n).forEach((q) => { picked.push(q); used.add(q.id); });
    }
    // Đảm bảo có ít nhất 1 câu điểm liệt
    if (!picked.some((q) => q.dl)) {
      const dl = shuffle(BANK.filter((q) => q.dl))[0];
      if (dl) { const i = picked.findIndex((q) => q.ch === dl.ch) ; const r = i >= 0 ? i : picked.length - 1; used.delete(picked[r]?.id); picked[r] = dl; used.add(dl.id); }
    }
    // Bù đủ số câu nếu chương nào thiếu
    const rest = shuffle(BANK.filter((q) => !used.has(q.id)));
    while (picked.length < EXAM.total && rest.length) picked.push(rest.pop());
    const list = picked.slice(0, EXAM.total).sort((a, b) => a.ch - b.ch);
    return { ids: list.map((q) => q.id), answers: {}, startAt: Date.now(), endAt: Date.now() + EXAM.minutes * 60000 };
  }

  function viewExam(sub, params) {
    const main = $('#main');
    if (sub === 'run') {
      const exam = load(EXAM_KEY, null);
      if (!exam) { location.hash = '#/exam'; return; }
      const list = exam.ids.map(qById).filter(Boolean);
      cleanup = Quiz({ main, list, mode: 'exam', title: 'Thi thử C1', exam, onFinish: ({ timeUp }) => finishExam(exam, list, timeUp) });
      return;
    }
    if (sub === 'result' || sub === 'review') {
      const i = params.get('i') != null ? +params.get('i') : state.exams.length - 1;
      const rec = state.exams[i];
      if (!rec) { location.hash = '#/exam'; return; }
      if (sub === 'review') {
        const list = rec.ids.map(qById).filter(Boolean);
        cleanup = Quiz({ main, list, mode: 'review', title: 'Xem lại bài thi', exam: rec });
        return;
      }
      return viewResult(main, rec, i);
    }

    setTop('Thi thử', { actions: themeBtn() });
    const pending = load(EXAM_KEY, null);
    const hist = state.exams.slice().reverse().slice(0, 5);
    main.innerHTML = `
      <div class="page-head"><h2 class="desk">Thi thử sát hạch C1</h2><p>Đề được tạo ngẫu nhiên theo cấu trúc đề thi, có tính giờ như thi thật.</p></div>
      <div class="grid lg-cols-3" style="align-items:start">
        <div class="card pad" style="grid-column: span ${window.innerWidth >= 1024 ? 2 : 1}">
          <div class="grid cols-2 sm-cols-2 lg-cols-4" style="margin-bottom:18px">
            <div class="card stat"><div class="ico">📝</div><div><b>${EXAM.total}</b><span>câu hỏi</span></div></div>
            <div class="card stat"><div class="ico">⏱</div><div><b>${EXAM.minutes}'</b><span>thời gian</span></div></div>
            <div class="card stat"><div class="ico">🎯</div><div><b>${EXAM.pass}</b><span>câu để đạt</span></div></div>
            <div class="card stat"><div class="ico">⚠️</div><div><b>≥1</b><span>câu điểm liệt</span></div></div>
          </div>
          <h3 style="font-size:1rem;margin-bottom:8px">Quy định</h3>
          <ul class="muted" style="margin:0 0 18px;padding-left:20px">
            <li>Trả lời đúng tối thiểu <b>${EXAM.pass}/${EXAM.total}</b> câu.</li>
            <li>Trả lời sai <b>bất kỳ câu điểm liệt</b> nào là <b>không đạt</b>, dù đủ điểm.</li>
            <li>Hết giờ hệ thống tự động nộp bài.</li>
            <li>Có thể chuyển qua lại giữa các câu và sửa đáp án trước khi nộp.</li>
          </ul>
          ${pending ? `<div class="note" style="margin-bottom:12px">Bạn đang có một bài thi dở dang (còn ${fmtTime(Math.max(0, Math.round((pending.endAt - Date.now()) / 1000)))}).</div>
            <div class="row"><a class="btn lg" href="#/exam/run" style="flex:1">⏱ Tiếp tục bài thi</a><button class="btn lg ghost" id="newExam" style="flex:1">Làm đề mới</button></div>`
            : `<button class="btn lg block" id="newExam">▶ Bắt đầu thi</button>`}
          ${usingCustomBank() ? '' : `<p class="muted" style="font-size:.82rem;margin:12px 0 0">Đang dùng bộ câu hỏi mẫu (${BANK.length} câu). Nạp bộ đề đầy đủ trong <a href="#/settings">Cài đặt</a>.</p>`}
        </div>
        <div class="card">
          <div class="section-head" style="padding:16px 16px 0"><h2 style="font-size:1.05rem">Lịch sử</h2>${state.exams.length ? '<a href="#/stats">Tất cả →</a>' : ''}</div>
          ${hist.length ? `<div class="list">${hist.map((e, k) => `<a href="#/exam/result?i=${state.exams.length - 1 - k}" style="color:inherit">${examRow(e)}</a>`).join('')}</div>` : `<div class="empty"><div class="ico">🗒️</div><p>Chưa có bài thi nào.</p></div>`}
        </div>
      </div>`;
    $('#newExam').onclick = () => {
      const go = () => { save(EXAM_KEY, buildExam()); location.hash = '#/exam/run'; };
      if (pending) openSheet(`<h3>Làm đề mới?</h3><p>Bài thi đang làm dở sẽ bị huỷ.</p><div class="sheet-actions"><button class="btn ghost" data-close>Huỷ</button><button class="btn danger" id="okNew">Làm đề mới</button></div>`, (el) => { $('#okNew', el).onclick = go; });
      else go();
    };
  }

  function finishExam(exam, list, timeUp) {
    let score = 0, critFail = false;
    for (const q of list) {
      const a = exam.answers[q.id];
      const ok = a === q.c;
      if (ok) score++;
      if (q.dl && !ok) critFail = true;
      // cập nhật thống kê ôn tập
      if (a != null) { const r = state.answers[q.id] || { n: 0, wrong: 0 }; r.last = a; r.ok = ok; r.n++; if (!ok) r.wrong++; state.answers[q.id] = r; }
    }
    const rec = {
      at: Date.now(), ids: exam.ids, answers: exam.answers, score, total: list.length,
      used: Math.min(EXAM.minutes * 60, Math.round((Date.now() - exam.startAt) / 1000)),
      critFail, timeUp, passed: score >= Math.min(EXAM.pass, list.length) && !critFail,
    };
    state.exams.push(rec);
    if (state.exams.length > 50) state.exams.shift();
    persist();
    localStorage.removeItem(EXAM_KEY);
    location.hash = '#/exam/result?i=' + (state.exams.length - 1);
  }

  function viewResult(main, rec, i) {
    setTop('Kết quả thi', { back: '#/exam' });
    const list = rec.ids.map(qById).filter(Boolean);
    const wrong = list.filter((q) => rec.answers[q.id] !== q.c);
    const blank = list.filter((q) => rec.answers[q.id] == null).length;
    main.innerHTML = `
      <div class="grid lg-cols-3" style="align-items:start">
        <div class="card result-hero ${rec.passed ? 'pass' : 'fail'}">
          <div style="font-size:3rem">${rec.passed ? '🎉' : '😓'}</div>
          <span class="badge-big">${rec.passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}</span>
          <div class="big">${rec.score}/${rec.total}</div>
          <p class="muted" style="margin:0">${rec.critFail ? '⚠️ Bạn đã trả lời sai câu điểm liệt.' : rec.passed ? 'Chúc mừng! Bạn đã vượt qua bài thi.' : `Cần tối thiểu ${EXAM.pass} câu đúng để đạt.`}</p>
          <div class="grid cols-2" style="margin-top:18px;text-align:left">
            <div class="card stat"><div class="ico">⏱</div><div><b>${fmtTime(rec.used)}</b><span>${rec.timeUp ? 'Hết giờ' : 'Thời gian'}</span></div></div>
            <div class="card stat"><div class="ico">⬜</div><div><b>${blank}</b><span>Bỏ trống</span></div></div>
          </div>
          <div class="row" style="margin-top:16px">
            <a class="btn ghost" style="flex:1" href="#/exam/review?i=${i}">Xem lại đề</a>
            <button class="btn" style="flex:1" id="again">Thi lại</button>
          </div>
        </div>
        <div class="card" style="grid-column: span ${window.innerWidth >= 1024 ? 2 : 1}">
          <div class="section-head" style="padding:16px 16px 0"><h2 style="font-size:1.05rem">Câu sai / bỏ trống (${wrong.length})</h2></div>
          ${wrong.length ? wrong.map((q) => {
            const a = rec.answers[q.id];
            const m = q.sign && signById(q.sign) ? `<div class="mini">${signById(q.sign).svg}</div>` : q.scene ? `<div class="mini scene">${renderScene(q.scene)}</div>` : '';
            return `<div class="review-item"><div class="row"><span class="chip">Câu ${list.indexOf(q) + 1}</span>${q.dl ? '<span class="chip red">⚠️ Điểm liệt</span>' : ''}</div>
              <div class="q">${esc(q.q)}</div>${m}
              ${a != null ? `<div class="a bad">${esc(q.a[a])}</div>` : `<div class="a bad" style="text-decoration:none">(Không trả lời)</div>`}
              <div class="a ok">✓ ${esc(q.a[q.c])}</div>
              ${q.exp ? `<p class="muted" style="font-size:.88rem;margin:8px 0 0">💡 ${esc(q.exp)}</p>` : ''}</div>`;
          }).join('') : `<div class="empty"><div class="ico">🏆</div><p>Tuyệt vời! Bạn không sai câu nào.</p></div>`}
        </div>
      </div>`;
    $('#again').onclick = () => { save(EXAM_KEY, buildExam()); location.hash = '#/exam/run'; };
  }

  // ================= BIỂN BÁO =================
  function viewSigns(main) {
    setTop('Biển báo', { actions: themeBtn() });
    let group = 'all', q = '';
    main.innerHTML = `
      <div class="page-head"><h2 class="desk">Hệ thống biển báo hiệu</h2><p>Chạm vào biển để xem ý nghĩa chi tiết.</p></div>
      <input class="search" type="search" id="signSearch" placeholder="Tìm biển báo (vd: cấm đỗ, P.102…)" aria-label="Tìm biển báo" />
      <div class="tabs" style="margin-top:12px" role="tablist">
        <button class="tab active" data-g="all" role="tab">Tất cả</button>
        ${Object.entries(SIGN_GROUPS).map(([k, g]) => `<button class="tab" data-g="${k}" role="tab">${g.name}</button>`).join('')}
      </div>
      <div id="signList" style="margin-top:12px"></div>`;
    const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();
    function draw() {
      const nq = norm(q);
      const groups = Object.entries(SIGN_GROUPS).filter(([k]) => group === 'all' || k === group);
      const html = groups.map(([k, g]) => {
        const items = SIGNS.filter((s) => s.group === k && (!nq || norm(s.name + ' ' + s.code + ' ' + s.desc).includes(nq)));
        if (!items.length) return '';
        return `<section class="section" style="margin-top:12px"><div class="section-head"><h2>${g.name}</h2><span class="muted" style="font-size:.8rem">${g.hint}</span></div>
          <div class="sign-grid">${items.map((s) => `<button class="sign-card" data-id="${s.id}">${s.svg}<small>${s.code}</small><b>${esc(s.name)}</b></button>`).join('')}</div></section>`;
      }).join('');
      $('#signList').innerHTML = html || `<div class="empty"><div class="ico">🔍</div><p>Không tìm thấy biển báo phù hợp.</p></div>`;
      $$('.sign-card', main).forEach((b) => b.onclick = () => {
        const s = signById(b.dataset.id);
        const qs = BANK.filter((x) => x.sign === s.id);
        openSheet(`<div class="sign-detail">${s.svg}<span class="chip blue">${s.code}</span><h3 style="margin-top:10px">${esc(s.name)}</h3><p>${esc(s.desc)}</p></div>
          <div class="sheet-actions"><button class="btn ghost" data-close>Đóng</button>${qs.length ? `<a class="btn" href="#/practice/ch6">Luyện câu biển báo</a>` : ''}</div>`);
      });
    }
    $('#signSearch').addEventListener('input', (e) => { q = e.target.value; draw(); });
    $$('.tab', main).forEach((t) => t.onclick = () => { $$('.tab', main).forEach((x) => x.classList.toggle('active', x === t)); group = t.dataset.g; draw(); });
    draw();
  }

  // ================= MẸO =================
  function viewTips(main) {
    setTop('Mẹo ghi nhớ', { back: window.innerWidth < 1024 ? '#/more' : null, actions: themeBtn() });
    main.innerHTML = `
      <div class="page-head"><h2 class="desk">Mẹo ghi nhớ nhanh</h2><p>Tổng hợp các con số và quy tắc hay gặp trong đề thi C1.</p></div>
      <div class="grid lg-cols-2" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))">
        <div class="card tip"><h3>⚠️ Câu điểm liệt</h3><ul>
          <li>Câu hỏi có cụm <b>“có bị nghiêm cấm không”</b> về ma tuý, rượu bia, đua xe, bỏ trốn sau tai nạn → chọn <b>“Bị nghiêm cấm”</b>.</li>
          <li>Câu về trách nhiệm khi gặp tai nạn → chọn đáp án <b>bảo vệ hiện trường, cứu giúp, báo tin</b>.</li>
          <li>Nồng độ cồn: <b>không có ngưỡng cho phép</b> với người lái xe.</li></ul></div>
        <div class="card tip"><h3>🚚 Hạng C1</h3><ul>
          <li>Ô tô tải, chuyên dùng có khối lượng toàn bộ theo thiết kế <b>trên 3,5 tấn đến 7,5 tấn</b>.</li>
          <li>Được kéo rơ moóc <b>≤ 750 kg</b>; được lái các xe hạng B.</li>
          <li>Tuổi tối thiểu: <b>18</b>. Thời hạn GPLX: <b>10 năm</b>.</li></ul></div>
        <div class="card tip"><h3>🚦 Thứ tự ưu tiên chấp hành</h3><ul>
          <li><b>Người điều khiển giao thông</b> → <b>Đèn tín hiệu</b> → <b>Biển báo</b> → <b>Vạch kẻ đường</b>.</li>
          <li>Tay giơ thẳng đứng: <b>tất cả dừng lại</b>. Tay dang ngang: trước & sau dừng, trái & phải được đi.</li></ul></div>
        <div class="card tip"><h3>🔀 Sa hình – thứ tự xe đi</h3><ul>
          <li>1. Xe đã vào giao lộ trước.</li>
          <li>2. <b>Xe ưu tiên</b>: chữa cháy → quân sự, công an → cứu thương → hộ đê…</li>
          <li>3. Xe trên <b>đường ưu tiên</b>.</li>
          <li>4. Xe có <b>bên phải trống</b> (không có xe đến từ bên phải).</li>
          <li>5. Hướng đi: <b>rẽ phải → đi thẳng → rẽ trái</b>.</li></ul></div>
        <div class="card tip"><h3>🏎 Tốc độ tối đa (ô tô)</h3>
          <div class="table-wrap"><table>
            <tr><th>Khu vực</th><th>Đường đôi*</th><th>Đường 2 chiều**</th></tr>
            <tr><td>Trong khu đông dân cư</td><td><b>60</b></td><td><b>50</b></td></tr>
            <tr><td>Ngoài KĐDC – xe con, tải ≤ 3,5 t</td><td><b>90</b></td><td><b>80</b></td></tr>
            <tr><td>Ngoài KĐDC – xe tải > 3,5 t</td><td><b>80</b></td><td><b>70</b></td></tr>
          </table></div>
          <p class="muted" style="font-size:.78rem;margin:6px 0 0">* Đường đôi / một chiều ≥ 2 làn. ** Đường hai chiều / một chiều 1 làn. Đơn vị km/h. Tham khảo Thông tư 38/2024/TT-BGTVT.</p></div>
        <div class="card tip"><h3>📏 Khoảng cách an toàn tối thiểu</h3>
          <div class="table-wrap"><table>
            <tr><th>Tốc độ (km/h)</th><th>Khoảng cách</th></tr>
            <tr><td>v = 60</td><td><b>35 m</b></td></tr>
            <tr><td>60 &lt; v ≤ 80</td><td><b>55 m</b></td></tr>
            <tr><td>80 &lt; v ≤ 100</td><td><b>70 m</b></td></tr>
            <tr><td>100 &lt; v ≤ 120</td><td><b>100 m</b></td></tr>
          </table></div></div>
        <div class="card tip"><h3>🚸 Nhận diện biển báo</h3><ul>
          <li><b>Tròn, viền đỏ</b> → biển CẤM. Có số → tốc độ <b>tối đa</b>.</li>
          <li><b>Tròn, nền xanh</b> → HIỆU LỆNH. Có số → tốc độ <b>tối thiểu</b>.</li>
          <li><b>Tam giác vàng</b> → NGUY HIỂM, cảnh báo.</li>
          <li><b>Vuông/chữ nhật xanh</b> → CHỈ DẪN.</li>
          <li>Nền xanh viền đỏ: <b>1 gạch</b> = cấm đỗ; <b>2 gạch (X)</b> = cấm dừng & đỗ.</li></ul></div>
        <div class="card tip"><h3>⏰ Con số cần nhớ</h3><ul>
          <li>Không dùng còi trong KĐDC: <b>22h – 5h</b>.</li>
          <li>Dừng đỗ cách lề không quá <b>0,25 m</b>.</li>
          <li>Lái xe liên tục ≤ <b>4 giờ</b>; ≤ <b>10 giờ/ngày</b>; ≤ <b>48 giờ/tuần</b>.</li>
          <li>Cứu hoả <b>114</b> · Cấp cứu <b>115</b> · Công an <b>113</b>.</li></ul></div>
      </div>
      <p class="muted" style="font-size:.8rem;margin-top:16px">Lưu ý: Nội dung mang tính tham khảo, hãy đối chiếu với văn bản pháp luật hiện hành và tài liệu chính thức của cơ sở đào tạo.</p>`;
  }

  // ================= THỐNG KÊ =================
  function viewStats(main) {
    setTop('Thống kê', { back: window.innerWidth < 1024 ? '#/more' : null, actions: themeBtn() });
    const s = stats();
    const ex = state.exams;
    const avg = ex.length ? (ex.reduce((a, e) => a + e.score, 0) / ex.length).toFixed(1) : '–';
    const hard = BANK.filter((q) => state.answers[q.id]?.wrong).sort((a, b) => state.answers[b.id].wrong - state.answers[a.id].wrong).slice(0, 8);
    const recent = ex.slice(-12);
    main.innerHTML = `
      <div class="page-head"><h2 class="desk">Thống kê học tập</h2></div>
      <div class="grid cols-2 lg-cols-4">
        <div class="card stat"><div class="ico">📚</div><div><b>${s.done}/${s.total}</b><span>Đã làm</span></div></div>
        <div class="card stat"><div class="ico">🎯</div><div><b>${s.done ? Math.round((s.ok / s.done) * 100) : 0}%</b><span>Tỷ lệ đúng</span></div></div>
        <div class="card stat"><div class="ico">📝</div><div><b>${ex.length}</b><span>Lần thi thử</span></div></div>
        <div class="card stat"><div class="ico">📊</div><div><b>${avg}</b><span>Điểm trung bình</span></div></div>
      </div>
      ${recent.length ? `<section class="section card pad"><h2 style="font-size:1.05rem;margin-bottom:14px">Điểm ${recent.length} lần thi gần nhất</h2>
        <div style="display:flex;align-items:flex-end;gap:6px;height:140px;border-bottom:1px solid var(--border);position:relative" role="img" aria-label="Biểu đồ điểm thi">
          <div style="position:absolute;left:0;right:0;bottom:${(EXAM.pass / EXAM.total) * 100}%;border-top:2px dashed var(--success);opacity:.6"></div>
          ${recent.map((e) => `<div title="${e.score}/${e.total}" style="flex:1;max-width:40px;height:${(e.score / e.total) * 100}%;border-radius:6px 6px 0 0;background:${e.passed ? 'var(--success)' : 'var(--danger)'};opacity:.85"></div>`).join('')}
        </div><p class="muted" style="font-size:.78rem;margin:8px 0 0">Đường nét đứt: mốc đạt ${EXAM.pass}/${EXAM.total}.</p></section>` : ''}
      <section class="section grid lg-cols-2" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))">
        <div class="card"><div class="section-head" style="padding:16px 16px 0"><h2 style="font-size:1.05rem">Câu hay sai nhất</h2>${hard.length ? '<a href="#/practice/wrong">Ôn ngay →</a>' : ''}</div>
          ${hard.length ? `<div class="list">${hard.map((q) => `<div class="list-item"><span class="chip red">${state.answers[q.id].wrong}×</span><div class="body" style="font-size:.9rem">${esc(q.q)}</div></div>`).join('')}</div>` : '<div class="empty"><p>Chưa có dữ liệu.</p></div>'}</div>
        <div class="card"><div class="section-head" style="padding:16px 16px 0"><h2 style="font-size:1.05rem">Lịch sử thi</h2></div>
          ${ex.length ? `<div class="list">${ex.slice().reverse().map((e, k) => `<a href="#/exam/result?i=${ex.length - 1 - k}" style="color:inherit">${examRow(e)}</a>`).join('')}</div>` : '<div class="empty"><p>Chưa có bài thi nào.</p></div>'}</div>
      </section>`;
  }

  // ================= THÊM (mobile) =================
  function viewMore(main) {
    setTop('Thêm', { actions: themeBtn() });
    main.innerHTML = `<div class="card list">
      <a class="list-item" href="#/tips"><div class="ico">💡</div><div class="body"><div class="title">Mẹo ghi nhớ</div><div class="sub">Con số, quy tắc hay gặp</div></div><span class="chev">›</span></a>
      <a class="list-item" href="#/stats"><div class="ico">📊</div><div class="body"><div class="title">Thống kê</div><div class="sub">Tiến độ, lịch sử thi, câu hay sai</div></div><span class="chev">›</span></a>
      <a class="list-item" href="#/settings"><div class="ico">⚙️</div><div class="body"><div class="title">Cài đặt</div><div class="sub">Giao diện, cỡ chữ, bộ đề, dữ liệu</div></div><span class="chev">›</span></a>
    </div>
    <p class="muted" style="text-align:center;font-size:.8rem;margin-top:20px">Ứng dụng hoạt động offline sau lần mở đầu tiên.<br>Có thể “Thêm vào màn hình chính” để dùng như app.</p>`;
  }

  // ================= CÀI ĐẶT =================
  function viewSettings(main) {
    setTop('Cài đặt', { back: window.innerWidth < 1024 ? '#/more' : null });
    const st = state.settings;
    const seg = (name, opts, cur) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-${name}="${v}" class="${String(cur) === String(v) ? 'active' : ''}">${l}</button>`).join('')}</div>`;
    const sw = (key, label, sub) => `<label class="setting"><div class="body"><div class="title" style="font-weight:700">${label}</div><div class="sub">${sub}</div></div><span class="switch"><input type="checkbox" data-sw="${key}" ${st[key] ? 'checked' : ''}><span></span></span></label>`;
    main.innerHTML = `
      <div class="page-head"><h2 class="desk">Cài đặt</h2></div>
      <div class="card">
        <div class="setting"><div class="body"><div class="title" style="font-weight:700">Giao diện</div><div class="sub">Sáng, tối hoặc theo hệ thống</div></div>${seg('theme', [['auto', 'Tự động'], ['light', 'Sáng'], ['dark', 'Tối']], st.theme)}</div>
        <div class="setting"><div class="body"><div class="title" style="font-weight:700">Cỡ chữ</div><div class="sub">Dễ đọc hơn trên điện thoại</div></div>${seg('fs', [[0.9, 'A−'], [1, 'A'], [1.1, 'A+'], [1.2, 'A++']], st.fontScale)}</div>
        ${sw('autoNext', 'Tự chuyển câu', 'Tự động sang câu tiếp khi trả lời đúng / khi thi')}
        ${sw('shuffleAns', 'Đảo thứ tự đáp án', 'Khi ôn tập, tránh học thuộc vị trí đáp án')}
        ${sw('haptics', 'Rung phản hồi', 'Rung nhẹ khi chọn đáp án (điện thoại)')}
      </div>
      <section class="section"><div class="section-head"><h2>Bộ câu hỏi</h2><span class="chip ${usingCustomBank() ? 'green' : 'amber'}">${usingCustomBank() ? 'Bộ đề tuỳ chỉnh' : 'Bộ câu hỏi mẫu'} · ${BANK.length} câu</span></div>
        <div class="card pad">
          <p style="margin-top:0">Ứng dụng đi kèm <b>bộ câu hỏi mẫu</b> để luyện tập. Bạn có thể nạp bộ đề đầy đủ (định dạng JSON) để ôn đúng ngân hàng đề thi chính thức.</p>
          <div class="row">
            <label class="btn soft" style="position:relative;overflow:hidden">📥 Nhập bộ đề JSON<input type="file" id="importFile" accept=".json,application/json" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label>
            <button class="btn ghost" id="exportBank">📤 Xuất bộ đề hiện tại</button>
            ${usingCustomBank() ? '<button class="btn ghost" id="resetBank">↺ Dùng lại bộ mẫu</button>' : ''}
          </div>
          <details style="margin-top:14px"><summary style="cursor:pointer;font-weight:700">Định dạng JSON</summary>
            <pre style="white-space:pre-wrap;background:var(--surface-2);padding:12px;border-radius:10px;font-size:.8rem;overflow:auto">[
  {
    "id": 1,
    "ch": 1,              // chương 1..7
    "q": "Nội dung câu hỏi",
    "a": ["Đáp án 1", "Đáp án 2", "Đáp án 3"],
    "c": 0,               // chỉ số đáp án đúng (bắt đầu từ 0)
    "dl": true,           // câu điểm liệt (tuỳ chọn)
    "exp": "Giải thích",  // tuỳ chọn
    "img": "https://…/hinh.png" // ảnh minh hoạ (tuỳ chọn)
  }
]</pre></details>
        </div></section>
      <section class="section"><div class="section-head"><h2>Dữ liệu</h2></div>
        <div class="card pad row">
          <button class="btn ghost" id="backup">💾 Sao lưu tiến độ</button>
          <label class="btn ghost" style="position:relative;overflow:hidden">♻️ Khôi phục<input type="file" id="restoreFile" accept=".json" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label>
          <button class="btn danger" id="resetAll">🗑 Xoá toàn bộ tiến độ</button>
        </div></section>`;

    $$('[data-theme]', main).forEach((b) => b.onclick = () => { st.theme = b.dataset.theme; applySettings(); persist(); viewSettings(main); });
    $$('[data-fs]', main).forEach((b) => b.onclick = () => { st.fontScale = +b.dataset.fs; applySettings(); persist(); viewSettings(main); });
    $$('[data-sw]', main).forEach((i) => i.onchange = () => { st[i.dataset.sw] = i.checked; persist(); toast('Đã lưu cài đặt'); });

    $('#importFile').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        const arr = Array.isArray(data) ? data : data.questions;
        if (!Array.isArray(arr) || !arr.length) throw new Error('Không tìm thấy danh sách câu hỏi');
        arr.forEach((q, i) => {
          if (typeof q.q !== 'string' || !Array.isArray(q.a) || typeof q.c !== 'number' || q.c < 0 || q.c >= q.a.length) throw new Error(`Câu thứ ${i + 1} sai định dạng`);
          if (q.id == null) q.id = i + 1; if (!q.ch) q.ch = 1;
        });
        save(BANK_KEY, arr); loadBank(); state.answers = {}; state.flags = {}; persist();
        toast(`✅ Đã nạp ${arr.length} câu hỏi`); viewSettings(main);
      } catch (err) { toast('❌ Lỗi: ' + err.message); }
    };
    $('#exportBank').onclick = () => download('bo-de-c1.json', BANK);
    $('#resetBank') && ($('#resetBank').onclick = () => { localStorage.removeItem(BANK_KEY); loadBank(); state.answers = {}; state.flags = {}; persist(); toast('Đã dùng lại bộ câu hỏi mẫu'); viewSettings(main); });
    $('#backup').onclick = () => download('tien-do-c1.json', state);
    $('#restoreFile').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { const d = JSON.parse(await f.text()); if (!d.answers) throw 0; state = Object.assign(defaults(), d); state.settings = Object.assign(defaults().settings, d.settings); persist(); applySettings(); toast('✅ Đã khôi phục tiến độ'); viewSettings(main); }
      catch (err) { toast('❌ Tệp không hợp lệ'); }
    };
    $('#resetAll').onclick = () => openSheet(`<h3>Xoá toàn bộ tiến độ?</h3><p>Mọi kết quả ôn tập, câu đánh dấu và lịch sử thi sẽ bị xoá. Không thể hoàn tác.</p>
      <div class="sheet-actions"><button class="btn ghost" data-close>Huỷ</button><button class="btn danger" id="okReset">Xoá</button></div>`, (el) => {
      $('#okReset', el).onclick = () => {
        const settings = state.settings; state = defaults(); state.settings = settings; persist();
        Object.keys(localStorage).filter((k) => k.startsWith('c1:pos:') || k === EXAM_KEY).forEach((k) => localStorage.removeItem(k));
        closeSheet(); toast('Đã xoá tiến độ'); viewSettings(main);
      };
    });
  }
  function download(name, data) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ================= Theme =================
  function applySettings() {
    const r = document.documentElement;
    if (state.settings.theme === 'auto') delete r.dataset.theme; else r.dataset.theme = state.settings.theme;
    r.style.setProperty('--fs', state.settings.fontScale);
  }
  const themeBtn = () => `<button class="icon-btn" data-action="toggle-theme" aria-label="Đổi giao diện sáng/tối" title="Đổi giao diện"><svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>`;
  function toggleTheme() {
    const dark = state.settings.theme === 'dark' || (state.settings.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    state.settings.theme = dark ? 'light' : 'dark'; applySettings(); persist();
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="toggle-theme"]')) toggleTheme();
    if (e.target.closest('[data-close]')) closeSheet();
  });

  // ================= Sheet & toast =================
  let lastFocus = null;
  function openSheet(html, after) {
    lastFocus = document.activeElement;
    $('#sheetBody').innerHTML = html;
    $('#sheet').hidden = false; $('#sheetBackdrop').hidden = false;
    document.body.style.overflow = 'hidden';
    after && after($('#sheetBody'));
    const f = $('#sheet').querySelector('button, a, input'); f && f.focus({ preventScroll: true });
  }
  function closeSheet() {
    if ($('#sheet').hidden) return;
    $('#sheet').hidden = true; $('#sheetBackdrop').hidden = true; document.body.style.overflow = '';
    lastFocus && document.contains(lastFocus) && lastFocus.focus({ preventScroll: true });
  }
  $('#sheetBackdrop').addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
  // Kéo xuống để đóng sheet (mobile)
  (() => { let y0 = null; const sh = $('#sheet');
    sh.addEventListener('touchstart', (e) => { y0 = sh.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
    sh.addEventListener('touchend', (e) => { if (y0 != null && e.changedTouches[0].clientY - y0 > 90) closeSheet(); y0 = null; }, { passive: true });
  })();
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200); }

  // ================= Khởi động =================
  window.addEventListener('hashchange', route);
  applySettings();
  route();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
