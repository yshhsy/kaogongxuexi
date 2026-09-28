// 考公学习 · V2
// 出题 → 作答 → 知识点 + 解析 · 单题计时 · 模块总览 · 错题本
// 错题自动收录、答对即移出、隔期优先重出 · localStorage 持久化（兼容迁移 v1）
// V3.5：新增申论模块（主观题自评：材料+问题+参考答案，对照自评「答到了/没答到」计分）

// PWA 原生化：禁掉 iOS 双指捏合缩放（gesturestart 仅 iOS 触发，其他平台无此事件）
document.addEventListener("gesturestart", function (e) { e.preventDefault(); });

(function () {
  "use strict";

  // ---------- 题库汇总 ----------
  // 动态收集：按 index.html 引入顺序扫描 window 上所有 QUESTIONS_* 题库
  var BANKS = [];
  Object.keys(window).forEach(function (k) {
    if (/^QUESTIONS_[A-Z0-9_]+$/.test(k) && window[k] && window[k].questions) BANKS.push(window[k]);
  });

  var ALL_MATERIALS = {};
  var ALL_QUESTIONS = [];
  BANKS.forEach(function (bank) {
    if (!bank) return;
    Object.keys(bank.materials || {}).forEach(function (k) {
      // 兼容两种材料格式：旧库存纯字符串，新年份库存 {module, source, content} 对象
      var m = bank.materials[k];
      ALL_MATERIALS[k] = (m && typeof m === "object") ? (m.content || "") : m;
    });
    (bank.questions || []).forEach(function (q) {
      if (bank.exam && !q.exam) q.exam = bank.exam; // 题库级 exam 标记下发到每题
      ALL_QUESTIONS.push(q);
    });
  });

  var MODULES = [
    { key: "常识判断", zi: "识", desc: "政治法律 · 人文科技 · 时政" },
    { key: "言语理解与表达", zi: "言", desc: "逻辑填空 · 阅读理解 · 篇章" },
    { key: "数量关系", zi: "数", desc: "行程工程 · 利润概率 · 组合" },
    { key: "判断推理", zi: "判", desc: "定义类比 · 图形逻辑 · 论证" },
    { key: "资料分析", zi: "资", desc: "增长率 · 比重 · 倍数平均" }
  ];

  var MODULE_SHORT = {
    "常识判断": "常识",
    "言语理解与表达": "言语",
    "数量关系": "数量",
    "判断推理": "判断",
    "资料分析": "资料",
    "申论": "申论"
  };

  var SHENLUN = "申论";
  function isShenlun(q) { return q.module === SHENLUN; }

  // 考试范围：国考 / 天津市考（首页切换，全站按范围过滤）
  function examOf(q) { return q.exam || "guokao"; }
  function scopeExam() { return store.examScope || "guokao"; }
  function scopedPool() {
    var ex = scopeExam();
    return ALL_QUESTIONS.filter(function (q) { return examOf(q) === ex; });
  }

  // 知识点：新题挂在题上（knowledgeIds），老题查映射表（QUESTION_KNOWLEDGE）
  function kpsOf(q) {
    var ids = (q.knowledgeIds && q.knowledgeIds.length)
      ? q.knowledgeIds
      : (window.QUESTION_KNOWLEDGE && window.QUESTION_KNOWLEDGE[q.id]) || [];
    var K = window.KNOWLEDGE || {};
    return ids
      .filter(function (k) { return K[k]; })
      .map(function (k) { return K[k]; });
  }

  // ---------- localStorage ----------
  var STORE_KEY = "xingce-quiz-v2";
  var LEGACY_KEY = "xingce-quiz-v1";

  function defaultStore() {
    return {
      today: "",          // 今日日期串
      todayCount: 0,      // 今日已练题数
      days: {},           // "2025-09-24" -> 当日题数（印谱数据源）
      stats: {},          // qid -> {right, wrong}
      wrong: {},          // qid -> {fails, lastWrongAt, lastPracticedAt, rightStreak}
      favorites: {},       // qid -> 1（手动收藏）
      notes: {},          // qid -> 用户备注文本
      answeredOrder: [],  // 最近答过的题 id（避免重复出题）
      examScope: "guokao", // 刷题范围："guokao" | "tianjin"
      mixCount: 10,        // 随机练习题量：10 | 20 | 30
      dailyDate: "",       // 每日一练当前组卷日期（跨天重置）
      dailyDone: {},       // 每日一练已答 qid -> 1（今天当轮完成进度）
      lastAnswer: {}       // 作答痕迹：qid -> { pick: "B", correct: true }（重遇题回显上次选择）
    };
  }

  function fmtDate(d) {
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign(defaultStore(), JSON.parse(raw));
      // 迁移 v1 数据（保留做题记录与错题，印谱从今天重新盖起）
      var v1 = localStorage.getItem(LEGACY_KEY);
      if (v1) {
        var s = JSON.parse(v1);
        var d = defaultStore();
        d.today = s.today || "";
        d.todayCount = s.todayCount || 0;
        d.stats = s.stats || {};
        d.wrong = s.wrong || {};
        d.answeredOrder = s.answeredOrder || [];
        // v1 错题缺时间戳，补当前时间（视为最近错过，可参与隔期重练调度）
        Object.keys(d.wrong).forEach(function (k) {
          if (!d.wrong[k].lastWrongAt) d.wrong[k].lastWrongAt = Date.now();
          if (!d.wrong[k].lastPracticedAt) d.wrong[k].lastPracticedAt = Date.now();
        });
        if (d.today && d.todayCount > 0) d.days[d.today] = d.todayCount;
        return d;
      }
    } catch (e) { /* 损坏则重建 */ }
    return defaultStore();
  }

  function saveStore() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* 忽略 */ }
  }

  var store = loadStore();
  var todayStr = fmtDate(new Date());

  if (store.today !== todayStr) {
    store.today = todayStr;
    store.todayCount = 0;
    saveStore();
  }

  // 每日一练：跨天重置当日进度
  if (store.dailyDate !== todayStr) {
    store.dailyDate = todayStr;
    store.dailyDone = {};
    saveStore();
  }

  function syncToday() {
    store.days[todayStr] = store.todayCount;
  }

  // ---------- DOM ----------
  var $ = function (id) { return document.getElementById(id); };

  var views = {
    home: $("view-home"),
    quiz: $("view-quiz"),
    wrong: $("view-wrong"),
    fav: $("view-fav"),
    catalog: $("view-catalog"),
    slguide: $("view-sl-guide"),
    stats: $("view-stats"),
    search: $("view-search")
  };

  // ---------- 工具 ----------
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var CN_NUMS = ["一", "二", "三", "四", "五", "六", "七", "八"];

  function fmtRel(ts) {
    if (!ts || !isFinite(ts)) return "早前";
    var day = 24 * 3600 * 1000;
    var diff = Math.floor((Date.now() - ts) / day);
    if (diff <= 0) return "今天";
    if (diff === 1) return "昨天";
    return diff + " 天前";
  }

  function toast(msg) {
    var el = $("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.hidden = true; }, 2400);
  }

  // ---------- 列表页滚动位置记忆（返回时回到上次浏览处，如卷目滑到 80 题返回仍在 80 题） ----------
  var LIST_VIEWS = ["home", "catalog", "wrong", "fav", "search"];
  var scrollMemo = {};

  function showView(name, keepScroll) {
    var cur = null;
    Object.keys(views).forEach(function (k) { if (views[k].hidden === false) cur = k; });
    if (cur && LIST_VIEWS.indexOf(cur) >= 0 && typeof window !== "undefined" && window.scrollY) {
      scrollMemo[cur] = window.scrollY; // 离开列表页前记住浏览位置
    }
    Object.keys(views).forEach(function (k) { views[k].hidden = (k !== name); });
    $("btn-back").hidden = (name === "home");
    $("btn-home").hidden = (name === "home");
    renderTabbar(name);
    var y = (keepScroll && scrollMemo[name]) || 0;
    if (y > 0 && document.documentElement) {
      // smooth 滚动会让恢复变成从顶部滑下来的动画，恢复位置需瞬时完成
      var prev = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, y);
      document.documentElement.style.scrollBehavior = prev;
    } else {
      window.scrollTo(0, 0);
    }
  }

  // ---------- 底部导航 ----------
  var TAB_MAP = { home: "tab-home", wrong: "tab-wrong", fav: "tab-fav", stats: "tab-stats" };

  function renderTabbar(activeView) {
    var activeTab = TAB_MAP[activeView] || null;
    ["tab-home", "tab-stats", "tab-wrong", "tab-fav"].forEach(function (id) {
      $(id).classList.toggle("on", id === activeTab);
    });
    // 导航角标同步（错题/收藏数，当前范围）
    var ex = scopeExam();
    var nW = Object.keys(store.wrong).filter(function (id2) {
      var q = ALL_QUESTIONS.find(function (x) { return x.id === id2; });
      return q && examOf(q) === ex;
    }).length;
    var wBadge = $("tab-wrong-b");
    wBadge.textContent = nW;
    wBadge.hidden = nW === 0;
    var nF = Object.keys(store.favorites || {}).filter(function (id2) {
      var q = ALL_QUESTIONS.find(function (x) { return x.id === id2; });
      return q && examOf(q) === ex;
    }).length;
    var fBadge = $("tab-fav-b");
    fBadge.textContent = nF;
    fBadge.hidden = nF === 0;
  }

  // 返回上一级：答题页回进入前的页面；申论指南回申论卷目；其余视图回首页
  function goBack() {
    if (!views.quiz.hidden) { backToOrigin(); return; }
    if (!views.slguide.hidden) { showView("catalog", true); return; }
    if (!views.search.hidden) { showView("home", true); return; }
    goHome(true);
  }

  // ---------- 出题策略 ----------
  // 隔期优先：超过 2 天没练的错题优先重出；未做错的新题次之；避开最近答过的
  function pickQuestions(pool, count) {
    var now = Date.now();
    var TWO_DAYS = 2 * 24 * 3600 * 1000;
    var recent = store.answeredOrder.slice(-Math.min(5, pool.length));

    var due = [];
    var fresh = [];
    pool.forEach(function (q) {
      if (recent.indexOf(q.id) >= 0) return;
      var w = store.wrong[q.id];
      if (w && (!w.lastPracticedAt || now - w.lastPracticedAt > TWO_DAYS)) {
        due.push(q);
      } else if (!w) {
        fresh.push(q);
      }
    });

    var picked = shuffle(due).slice(0, count);
    if (picked.length < count) {
      picked = picked.concat(shuffle(fresh).slice(0, count - picked.length));
    }
    if (picked.length < count) {
      var rest = pool.filter(function (q) { return picked.indexOf(q) < 0; });
      picked = picked.concat(shuffle(rest).slice(0, count - picked.length));
    }
    return shuffle(picked).slice(0, count);
  }

  // ---------- 每日一练：按日期+范围种子固定组卷，同一天题目一致，可断点续练 ----------
  function seededShuffle(arr, seed) {
    var a = arr.slice();
    var s = 0;
    for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    for (var j = a.length - 1; j > 0; j--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      var k = s % (j + 1);
      var t = a[j]; a[j] = a[k]; a[k] = t;
    }
    return a;
  }

  function dailyGroup() {
    var pool = scopedPool().filter(function (q) { return !isShenlun(q); });
    if (!pool.length) return [];
    return seededShuffle(pool, todayStr + "|" + scopeExam()).slice(0, Math.min(20, pool.length));
  }

  // 首页每日一练卡：进度/完成态/重练入口
  function renderDailyCard() {
    var card = $("daily-card");
    if (!card) return;
    var group = dailyGroup();
    card.hidden = group.length === 0;
    if (!group.length) return;
    var inGroup = {};
    group.forEach(function (q) { inGroup[q.id] = 1; });
    var done = 0;
    Object.keys(store.dailyDone).forEach(function (id) { if (inGroup[id]) done += 1; });
    var pct = Math.round(done * 100 / group.length);
    var finished = done >= group.length;
    $("daily-done-tag").hidden = !finished;
    $("daily-title").textContent = finished ? "今日一练已完成" : "每日一练";
    $("daily-meta").textContent = finished
      ? "已练 " + done + " / " + group.length + " 题 · 点击可再过一遍"
      : (done > 0
        ? "今日已完成 " + done + " / " + group.length + " 题，继续冲"
        : "今日 " + group.length + " 题待打卡");
    $("daily-bar-i").style.width = pct + "%";
  }

  // ---------- 答题状态 ----------
  var session = {
    queue: [],
    current: null,
    index: 0,
    mode: null,          // "module" | "mixed" | "wrong" | "fav"
    moduleId: null,
    from: "home",        // 进入来源："home" | "catalog" | "wrong" | "fav"（返回时回哪）
    selected: null,
    confirmed: false,
    peeked: false,       // 行测「直接看答案」中：true 后可回本题继续做或直接下一题
    timerStart: 0,
    timerId: null,
    rightCount: 0,
    times: []            // 每题用时（秒），实际答题数 = times.length，报告按此统计
  };

  // 答题页的“考试元素”显隐（结课小结时隐藏）
  var QUIZ_CHROME_IDS = ["quiz-head", "quiz-actions", "result-area", "kbd-tip"];
  function setQuizChrome(visible) {
    QUIZ_CHROME_IDS.forEach(function (id) { $(id).hidden = !visible; });
    document.querySelector(".qian-question").hidden = !visible;
    // 材料笺有自己的显隐逻辑：结课时隐藏，开考时交给 renderQuestion 按题设置
    if (!visible) $("material-card").hidden = true;
    $("summary-wrap").hidden = visible;
  }

  function startQuiz(mode, moduleId, opts) {
    opts = opts || {};
    var pool;
    if (mode === "wrong") {
      pool = scopedPool().filter(function (q) { return store.wrong[q.id] && !isShenlun(q); });
      if (pool.length === 0) { toast("错题本还是空的，先去练几道题吧"); return; }
    } else if (mode === "fav") {
      pool = scopedPool().filter(function (q) { return store.favorites[q.id] && !isShenlun(q); });
      if (pool.length === 0) { toast("收藏本还是空的，做题时点 ☆ 收藏喜欢的题吧"); return; }
    } else if (mode === "daily") {
      pool = dailyGroup();
      if (pool.length === 0) { toast("当前范围暂无可练题目"); return; }
    } else if (mode === "recite") {
      pool = scopedPool().filter(function (q) { return q.module === moduleId && !isShenlun(q); });
    } else if (mode === "module") {
      pool = scopedPool().filter(function (q) { return q.module === moduleId; });
    } else {
      // 随机练习只流行测五模块，申论主观题走申论专项入口
      pool = scopedPool().filter(function (q) { return !isShenlun(q); });
    }

    session.mode = mode;
    session.moduleId = moduleId || null;
    session.from = opts.from || "home";
    session.queue = mode === "mixed" ? pickQuestions(pool, store.mixCount || 10) : pool.slice(); // 列表模式保持列表顺序，可滑动浏览
    session.index = opts.startIndex || 0;
    if (session.index >= session.queue.length) session.index = 0;
    // 每日一练断点续练：跳到第一道今天还没答的题（全部答完则从第一题再来一轮）
    if (mode === "daily" && !opts.startIndex) {
      for (var di = 0; di < session.queue.length; di++) {
        if (!store.dailyDone[session.queue[di].id]) { session.index = di; break; }
      }
    }
    session.rightCount = 0;
    session.times = [];

    if (session.queue.length === 0) { toast("该模块暂时没有题目"); return; }
    showView("quiz");
    setQuizChrome(true);
    renderQuestion();
  }

  // 单题会话：搜题结果点击 / 好友分享深链（?q=<id>）进入，答完回来源页不出报告
  function startSingle(q, from) {
    session.mode = "single";
    session.moduleId = null;
    session.from = from || "home";
    session.queue = [q];
    session.index = 0;
    session.rightCount = 0;
    session.times = [];
    showView("quiz");
    setQuizChrome(true);
    renderQuestion();
  }

  // 本轮实时统计：随判卷更新，随时看到本轮正确率
  function renderRoundStat() {
    var el = $("round-stat");
    if (!el) return;
    var done = session.times.length;
    if (!done) { el.hidden = true; return; }
    el.hidden = false;
    var right = session.rightCount;
    var acc = Math.round(right * 100 / done);
    el.textContent = "本轮已答 " + done + " · 对 " + right + " · 错 " + (done - right) + " · 正确率 " + acc + "%";
  }

  function renderQuestion() {
    var q = session.queue[session.index];
    session.current = q;
    session.selected = null;
    session.confirmed = false;
    session.peeked = false;

    var modName = session.mode === "mixed"
      ? "随机练习"
      : session.mode === "daily" ? "每日一练"
      : session.mode === "recite" ? "背题 · " + MODULE_SHORT[q.module]
      : (session.mode === "wrong" ? "错题练习" : session.mode === "fav" ? "收藏练习"
      : session.mode === "single" ? (isShenlun(q) ? "申论学习" : "单题 · " + MODULE_SHORT[q.module])
      : isShenlun(q) ? "申论学习" : MODULE_SHORT[q.module] + "专项");
    $("quiz-module-tag").textContent = modName;
    $("quiz-source-tag").textContent = q.source;
    $("quiz-progress").textContent = (session.index + 1) + " / " + session.queue.length;
    renderRoundStat();
    $("quiz-timer").textContent = "00:00";
    $("quiz-timer").hidden = isShenlun(q) || session.mode === "recite"; // 申论纯学习/背题不计时

    // 易错标记：累计答错 ≥ 2 次
    var risky = store.stats[q.id] && store.stats[q.id].wrong >= 2;
    var riskEl = $("quiz-risk");
    riskEl.hidden = !risky;
    riskEl.textContent = "易错";

    // 上一题/下一题小箭头边界禁用
    $("btn-prev-q").disabled = session.index === 0;
    $("btn-next-q").disabled = session.index + 1 >= session.queue.length;

    // 收藏星标
    var fav = !!store.favorites[q.id];
    var favBtn = $("btn-fav");
    favBtn.textContent = fav ? "★" : "☆";
    favBtn.classList.toggle("on", fav);

    // 个人备注
    $("note-input").value = store.notes[q.id] || "";

    // 材料
    var matCard = $("material-card");
    if (q.materialId) {
      matCard.hidden = false;
      setRichText($("material-body"), ALL_MATERIALS[q.materialId] || "");
      $("material-body").classList.remove("collapsed");
      $("btn-toggle-material").textContent = "收起";
    } else {
      matCard.hidden = true;
    }

    // 题干与选项（含图形推理 SVG）；申论题无选项，走「查看参考答案」自评流
    setRichText($("question-text"), q.question);
    var figBox = $("q-figure");
    figBox.innerHTML = "";
    figBox.hidden = true;
    if (q.figure && /^\s*<svg/i.test(q.figure)) {
      figBox.innerHTML = q.figure; // 白名单：仅接受 SVG 图形
      figBox.hidden = false;
    }
    var optsBox = $("options");
    optsBox.innerHTML = "";
    var sl = isShenlun(q);
    optsBox.hidden = sl;
    $("btn-peek").hidden = sl; // 申论答案直接展示，无需偷看
    var confirmBtn = $("btn-confirm");
    confirmBtn.hidden = sl; // 申论纯学习，无提交动作
    confirmBtn.textContent = "提交答案";
    confirmBtn.disabled = true;
    var letters = ["A", "B", "C", "D", "E", "F"];
    var optFigs = q.optionFigures || [];
    (q.options || []).forEach(function (text, i) {
      var btn = document.createElement("button");
      btn.className = "option" + (optFigs[i] ? " has-figure" : "");
      btn.innerHTML = '<span class="opt-key">' + letters[i] + '</span><span class="opt-body"></span>';
      var body = btn.querySelector(".opt-body");
      if (optFigs[i] && /^\s*<svg/i.test(optFigs[i])) {
        var fig = document.createElement("span");
        fig.className = "opt-figure";
        fig.innerHTML = optFigs[i];
        body.appendChild(fig);
      }
      if (text) {
        var tx = document.createElement("span");
        tx.className = "opt-text";
        setRichText(tx, text);
        body.appendChild(tx);
      }
      btn.addEventListener("click", function () { selectOption(i); });
      optsBox.appendChild(btn);
    });

    // 按钮与结果区
    $("btn-next").hidden = true;
    $("result-area").hidden = true;
    if (sl) shenlunShow(q); // 申论：材料+问题+参考答案同屏展示，自评键直接可用
    if (!sl && session.mode === "recite") reciteShow(q); // 背题模式：答案高亮+解析直出，不判卷不记账
    if (!sl && session.mode !== "wrong" && session.mode !== "recite" && store.lastAnswer[q.id]) {
      replayLastAnswer(q); // 作答痕迹：重遇做过的题直接呈现「提交后」的判卷页效果
    }

    // 计时
    session.timerStart = Date.now();
    clearInterval(session.timerId);
    session.timerId = setInterval(function () {
      var sec = Math.floor((Date.now() - session.timerStart) / 1000);
      var m = String(Math.floor(sec / 60)).padStart(2, "0");
      var s = String(sec % 60).padStart(2, "0");
      $("quiz-timer").textContent = m + ":" + s;
    }, 1000);
  }

  // 当前题备注落盘（切题前/失焦时调用）
  function saveCurrentNote() {
    var id = session.current && session.current.id;
    if (!id) return;
    var v = ($("note-input").value || "").trim();
    if (v) store.notes[id] = v;
    else if (store.notes[id]) delete store.notes[id];
    saveStore();
  }

  // ---------- 平滑翻页（带方向滑出/滑入，滑动、箭头、键盘、下一题共用） ----------
  var QCARD = document.querySelector(".qian-question");
  var ANIM = typeof window.matchMedia === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pageTimer = null;

  function pageTo(delta) {
    saveCurrentNote();
    var next = session.index + delta;
    if (next < 0 || next >= session.queue.length) return;
    session.index = next;
    if (!ANIM || !QCARD) { renderQuestion(); return; }
    // 重复滑动时打断上一次动画，从当前状态重新起翻
    clearTimeout(pageTimer);
    QCARD.classList.remove("page-out-left", "page-out-right", "page-in-left", "page-in-right");
    // 第一段：旧卡滑出（期间内容不变，可继续作答当前题）
    QCARD.classList.add(delta > 0 ? "page-out-left" : "page-out-right");
    pageTimer = setTimeout(function () {
      // 第二段：换内容，新卡从另一侧滑入
      QCARD.classList.remove("page-out-left", "page-out-right");
      renderQuestion();
      QCARD.classList.add(delta > 0 ? "page-in-right" : "page-in-left");
      pageTimer = setTimeout(function () {
        QCARD.classList.remove("page-in-left", "page-in-right");
      }, 300);
    }, 170);
  }

  // 上一题（浏览模式：无论是否作答都可回看）
  function prevQuestion() { pageTo(-1); }

  // 浏览式下一题（只切题不结课；判卷后的“下一题”按钮另有结课分支）
  function browseNext() { pageTo(1); }

  function selectOption(i) {
    var q = session.current;
    if (session.confirmed || !q || !q.options || !q.options.length) return;
    if (i >= q.options.length) return;
    session.selected = i;
    var optsBox = $("options");
    Array.prototype.forEach.call(optsBox.children, function (el, idx) {
      el.classList.toggle("selected", idx === i);
    });
    $("btn-confirm").disabled = false;
  }

  // 作答记账（行测判卷用）：todayCount/stats/wrong/answeredOrder；申论纯学习不记账
  function recordResult(q, correct) {
    store.todayCount += 1;
    syncToday();
    if (session.mode === "daily") store.dailyDone[q.id] = 1; // 每日一练进度标记
    store.lastAnswer[q.id] = { pick: ["A", "B", "C", "D", "E", "F"][session.selected], correct: correct }; // 作答痕迹：重遇题回显
    if (!store.stats[q.id]) store.stats[q.id] = { right: 0, wrong: 0 };
    if (correct) {
      store.stats[q.id].right += 1;
      session.rightCount += 1;
      var w = store.wrong[q.id];
      if (w) {
        w.lastPracticedAt = Date.now();
        w.rightStreak = (w.rightStreak || 0) + 1;
        if (w.rightStreak >= 3) delete store.wrong[q.id]; // 连对三次才销账
      }
    } else {
      store.stats[q.id].wrong += 1;
      var w0 = store.wrong[q.id];
      store.wrong[q.id] = {
        fails: (w0 ? w0.fails : 0) + 1,
        lastWrongAt: Date.now(),
        lastPracticedAt: Date.now(),
        rightStreak: 0 // 答错清零连对计数
      };
    }
    store.answeredOrder.push(q.id);
    if (store.answeredOrder.length > 100) store.answeredOrder = store.answeredOrder.slice(-100);
    saveStore();
  }

  // 富文本渲染：把题库文本里的 "img/xxx.png" 引用替换为 <img> 懒加载，其余安全走 textContent
  // 纯文字题零开销（无引用时直接 textContent 一条路）
  function setRichText(el, text) {
    if (!/\bimg\/[\w.\-]+\.(png|jpe?g|gif|webp)\b/i.test(text || "")) {
      el.textContent = text || "";
      return;
    }
    el.textContent = "";
    var re = /(\bimg\/[\w.\-]+\.(?:png|jpe?g|gif|webp)\b)/gi;
    var last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) el.appendChild(document.createTextNode(text.slice(last, m.index)));
      var pic = document.createElement("img");
      pic.src = m[1];
      pic.alt = "题目图片";
      pic.loading = "lazy";
      pic.decoding = "async";
      pic.className = "q-img";
      el.appendChild(pic);
      last = m.index + m[0].length;
    }
    if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
  }

  // 重遇做过的题（非错题本入口）：直接呈现上次提交后的页面效果（判卷着色+✓/✗+解析），锁定不重复记账
  function replayLastAnswer(q) {
    var la = store.lastAnswer[q.id];
    var letters = ["A", "B", "C", "D", "E", "F"];
    var optIdx = q.answer.charCodeAt(0) - 65;
    var pickIdx = letters.indexOf(la.pick);
    Array.prototype.forEach.call($("options").children, function (el, idx) {
      if (idx === optIdx) el.classList.add("correct");
      else if (idx === pickIdx) el.classList.add("wrong");
      else el.classList.add("dim");
    });
    session.confirmed = true; // 已呈判卷态，选项锁定不可重答（重练走错题本）
    stampResult(la.correct);
    var meta = $("result-meta");
    meta.innerHTML = "";
    if (la.correct) {
      meta.innerHTML = '上次作答已选 <span class="dai">' + la.pick + '</span> · 答对了 · 这题已掌握，温习下方解析';
    } else {
      meta.innerHTML = '上次作答已选 <span class="zhu">' + la.pick + '</span> · 答错了 · 正确答案是 <span class="dai">' +
        q.answer + '</span> · 再看一遍解析加深印象';
    }
    renderKnowledgeAndAnalysis(q);
    $("result-area").hidden = false;
    $("btn-confirm").hidden = true;
    $("btn-peek").hidden = true;
    showNextBtn();
  }

  function stampResult(correct) {
    var stamp = $("result-stamp");
    stamp.textContent = correct ? "✓" : "✗";
    stamp.className = "result-stamp " + (correct ? "ok" : "no");
    // 重触发盖章动画
    stamp.style.animation = "none";
    void stamp.offsetWidth;
    stamp.style.animation = "";
  }

  function confirmAnswer() {
    var q = session.current;
    if (session.peeked) { unpeek(); return; } // 「回到本题继续做」：收回答案重新作答
    if (session.selected === null || session.confirmed) return;
    session.confirmed = true;
    clearInterval(session.timerId);

    var usedSec = Math.round((Date.now() - session.timerStart) / 1000);
    session.times.push(usedSec);
    var letters = ["A", "B", "C", "D", "E", "F"];
    var userAnswer = letters[session.selected];
    var correct = userAnswer === q.answer;
    var optIdx = q.answer.charCodeAt(0) - 65;

    // 选项着色（同时清掉旧作答痕迹，按本次作答重新着色）
    var optsBox = $("options");
    Array.prototype.forEach.call(optsBox.children, function (el, idx) {
      el.classList.remove("selected", "last-pick");
      var oldTag = el.querySelector(".last-tag");
      if (oldTag && oldTag.remove) oldTag.remove();
      if (idx === optIdx) el.classList.add("correct");
      else if (idx === session.selected) el.classList.add("wrong");
      else el.classList.add("dim");
    });

    // 记账
    recordResult(q, correct);
    renderRoundStat();

    // 结果状态与说明
    stampResult(correct);

    var timeTxt = usedSec < 60
      ? usedSec + " 秒"
      : Math.floor(usedSec / 60) + " 分 " + (usedSec % 60) + " 秒";
    var meta = $("result-meta");
    meta.innerHTML = "";
    if (correct) {
      meta.innerHTML = '已选 <span class="dai">' + userAnswer + "</span> · 用时 " + timeTxt +
        (usedSec < 45 ? " · 反应很快，这题你掌握了" : (usedSec < 100 ? " · 稳定发挥" : " · 慢工出细活"));
    } else {
      meta.innerHTML = '已选 <span class="zhu">' + userAnswer + '</span> · 正确答案是 <span class="dai">' +
        q.answer + "</span> · 用时 " + timeTxt + " · 看看下面的知识点和解析吧";
    }

    // 知识点（先明其理）+ 解析（行测判卷/申论展示/直接看答案共用）
    renderKnowledgeAndAnalysis(q);

    $("result-area").hidden = false;
    $("btn-confirm").hidden = true;
    $("btn-peek").hidden = true;
    showNextBtn();
    // 判卷后自动滚到结果与解析（手机端不必再手动找）
    setTimeout(function () {
      var ra = $("result-area");
      if (ra && !ra.hidden) ra.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  // 申论解析/答案分离：把【参考答案】【参考提纲】小节从解析中抽出，单独成卡
  function splitShenlunAnalysis(text) {
    var guide = [], answer = [], target = guide;
    text.split(/(?=【)/).forEach(function (p) {
      var m = p.match(/^【([^】]+)】/);
      if (m && (m[1] === "参考答案" || m[1] === "参考提纲")) target = answer;
      else if (m) target = guide;
      target.push(p);
    });
    return { guide: guide.join("").trim(), answer: answer.join("").trim() };
  }

  // 渲染知识点笺与解析正文
  function renderKnowledgeAndAnalysis(q) {
    var ka = $("knowledge-area");
    ka.innerHTML = "";
    kpsOf(q).forEach(function (kp, i) {
      var div = document.createElement("article");
      div.className = "qian qian-knowledge";
      var cn = CN_NUMS[i] || String(i + 1);
      div.innerHTML =
        '<div class="qian-label">知识点 ' + cn + '</div>' +
        '<div class="kp-title"></div>' +
        '<div class="kp-body"></div>';
      div.querySelector(".kp-title").textContent = kp.title;
      div.querySelector(".kp-body").textContent = kp.body;
      ka.appendChild(div);
    });
    var ansCard = $("shenlun-answer-card");
    if (isShenlun(q)) {
      // 申论：先看「写作解析」（教怎么写），再对照「参考答案」（自己动笔后看）
      var sp = splitShenlunAnalysis(q.analysis);
      setRichText($("analysis-body"), sp.guide);
      setRichText($("shenlun-answer-body"), sp.answer || "本题无独立参考答案小节，解析内已含要点。");
      ansCard.hidden = false;
      $("analysis-label").textContent = "写作解析";
    } else {
      setRichText($("analysis-body"), q.analysis);
      ansCard.hidden = true;
      $("analysis-label").textContent = "答案解析";
    }
    var note = $("analysis-note");
    note.textContent = q.note ? "备注：本题" + q.note : "";
    note.style.display = q.note ? "" : "none";
  }

  function showNextBtn() {
    var nextBtn = $("btn-next");
    nextBtn.hidden = false;
    nextBtn.textContent = session.index + 1 < session.queue.length
      ? "下一题"
      : (session.mode === "wrong" ? "完成，返回错题本"
      : session.mode === "fav" ? "完成，返回收藏本"
      : session.mode === "single" ? "完成"
      : "完成，查看报告");
  }

  function showPendingStamp() {
    var stamp = $("result-stamp");
    stamp.textContent = "阅";
    stamp.className = "result-stamp pending";
    stamp.style.animation = "none";
    void stamp.offsetWidth;
    stamp.style.animation = "";
  }

  // ---------- 行测「直接看答案」：不答题也可看，不计入成绩；看完可回本题继续做或直接下一题 ----------
  function peekAnswer() {
    var q = session.current;
    if (isShenlun(q) || session.confirmed || session.peeked) return;
    session.peeked = true;

    // 高亮正确选项，其余淡去
    var optIdx = q.answer.charCodeAt(0) - 65;
    var optsBox = $("options");
    Array.prototype.forEach.call(optsBox.children, function (el, idx) {
      el.classList.remove("selected");
      el.classList.add(idx === optIdx ? "correct" : "dim");
    });

    showPendingStamp();
    $("result-meta").innerHTML = '正确答案是 <span class="dai">' + q.answer +
      '</span> · 直接看答案不计入成绩 · 可回到本题继续做，或直接下一题';
    renderKnowledgeAndAnalysis(q);

    $("result-area").hidden = false;
    var confirmBtn = $("btn-confirm");
    confirmBtn.hidden = false;
    confirmBtn.textContent = "回到本题继续做";
    confirmBtn.disabled = false;
    $("btn-peek").hidden = true;
    showNextBtn();
  }

  // 收回答案，回到作答状态（原选中态恢复，答题正常计成绩）
  function unpeek() {
    session.peeked = false;
    Array.prototype.forEach.call($("options").children, function (el, idx) {
      el.classList.remove("correct", "dim");
      el.classList.toggle("selected", session.selected === idx);
    });
    $("result-area").hidden = true;
    $("btn-next").hidden = true;
    var confirmBtn = $("btn-confirm");
    confirmBtn.textContent = "提交答案";
    confirmBtn.disabled = session.selected === null;
    $("btn-peek").hidden = false;
  }

  // ---------- 背题模式：自动亮答案+解析，不判卷不记账，适合纯记忆型背诵 ----------
  function reciteShow(q) {
    session.confirmed = true; // 锁定选项，背题中不可作答
    var optIdx = q.answer.charCodeAt(0) - 65;
    Array.prototype.forEach.call($("options").children, function (el, idx) {
      el.classList.remove("selected");
      el.classList.add(idx === optIdx ? "correct" : "dim");
    });
    showPendingStamp();
    $("result-meta").innerHTML = '正确答案是 <span class="dai">' + q.answer +
      '</span> · 背题模式不计成绩 · 记住结论后细看下方解析';
    renderKnowledgeAndAnalysis(q);
    $("result-area").hidden = false;
    $("btn-confirm").hidden = true;
    $("btn-peek").hidden = true;
    var nextBtn = $("btn-next");
    nextBtn.hidden = false;
    nextBtn.textContent = session.index + 1 < session.queue.length
      ? "下一题"
      : "完成，返回题目列表";
  }

  // ---------- 申论：纯学习模式，材料+问题+参考答案同屏，不记账不计成绩 ----------
  function shenlunShow(q) {
    showPendingStamp();
    $("result-meta").innerHTML = "学习模式：先自己动笔写要点，再对照参考答案与评分要点";
    renderKnowledgeAndAnalysis(q);
    $("result-area").hidden = false;
    var nextBtn = $("btn-next");
    nextBtn.hidden = false;
    nextBtn.textContent = session.index + 1 < session.queue.length
      ? "下一题"
      : "完成，返回题目列表";
  }

  function nextQuestion() {
    if (session.index + 1 < session.queue.length) {
      pageTo(1);
    } else if (isShenlun(session.current) || session.mode === "recite" || session.mode === "single" || session.times.length === 0) {
      // 申论纯学习/背题模式/单题分享/纯温习（全程只看未重答）：练完直接回来源页，不出做题报告
      clearInterval(session.timerId);
      backToOrigin();
      toast(session.mode === "recite" ? "背题完成，记得隔天再测一遍"
        : session.mode === "single" ? "本题练习完成，可继续搜其他题"
        : isShenlun(session.current) ? "申论学习完成"
        : "温习完成，错题本里的题记得重练");
    } else {
      clearInterval(session.timerId);
      renderSummary();
    }
  }

  // 返回进入答题前的页面（卷目 → 卷目并刷新状态；错题本 → 错题本；收藏本 → 收藏本；其余 → 首页）
  function backToOrigin() {
    var from = session.from || "home";
    session.from = "home";
    if (from === "catalog" && CAT_MOD) {
      renderCatalog();
      showView("catalog", true);
    } else if (from === "wrong") {
      renderWrongBook();
      showView("wrong", true);
    } else if (from === "fav") {
      renderFavBook();
      showView("fav", true);
    } else if (from === "search") {
      showView("search", true); // 回到搜题页，结果列表还在，可直接点下一道
    } else {
      goHome(true);
    }
  }

  // ---------- 结课小结 ----------
  function goHome(keepScroll) {
    clearInterval(session.timerId);
    session.from = "home";
    showView("home", keepScroll);
    renderHome();
    // renderHome 重渲染在 showView 滚动之后，回首页时再校准一次记忆位置（瞬时，不动画）
    if (keepScroll && scrollMemo.home && document.documentElement) {
      var prevB = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollMemo.home);
      document.documentElement.style.scrollBehavior = prevB;
    }
  }

  function renderSummary() {
    var n = session.times.length; // 实际作答题数（滑动跳过的题不计）
    var right = session.rightCount;
    var wrongN = n - right;
    var totalSec = session.times.reduce(function (a, b) { return a + b; }, 0);
    var avg = n ? Math.round(totalSec / n) : 0;

    setQuizChrome(false);

    var stamp = $("summary-stamp");
    var rate0 = n ? right / n : 0;
    var pct = Math.round(rate0 * 100);
    stamp.style.setProperty("--p", pct);
    stamp.innerHTML = "<span>" + pct + "%</span>";
    stamp.className = "summary-stamp" + (right === n ? " gold" : "");
    stamp.style.animation = "none";
    void stamp.offsetWidth;
    stamp.style.animation = "";

    var modeName = session.mode === "mixed" ? "随机练习"
      : session.mode === "daily" ? "每日一练"
      : (session.mode === "wrong" ? "错题练习"
      : session.mode === "fav" ? "收藏练习"
      : MODULE_SHORT[session.moduleId] + "专项练习");
    $("summary-title").textContent = modeName + " · 本轮 " + n + " 题";

    function ovItem(cls, num, unit, label) {
      return '<div class="ov-item ' + cls + '"><div class="ov-num">' + num +
        (unit ? '<span class="unit">' + unit + '</span>' : "") +
        '</div><div class="ov-label">' + label + "</div></div>";
    }
    $("summary-grid").innerHTML =
      ovItem("", right, "题", "对") +
      ovItem("", wrongN, "题", "错") +
      ovItem("acc", avg, "秒", "平均每题") +
      ovItem("streak", store.todayCount, "题", "今日已练");

    var rate = n ? right / n : 0;
    var comment;
    if (right === n) comment = "全部正确，太厉害了，继续保持！";
    else if (rate >= 0.8) comment = "表现不错，正确率很高，继续保持。";
    else if (rate >= 0.6) comment = "整体不错，把错题弄懂就能更进一步。";
    else comment = "别灰心，错题就是提升点，弄懂它们就是进步。";
    if (wrongN > 0) comment += " 错题已自动加入错题本。";
    $("summary-comment").textContent = comment;
  }

  function quitQuiz() {
    backToOrigin();
    toast("已练习 " + store.todayCount + " 题，继续加油！");
  }
  // ---------- 首页 ----------
  // 考试范围切换条：范围无题时隐藏胶囊，避免误入空题库
  function renderScopeBar() {
    var bar = $("scope-bar");
    if (!bar) return;
    var counts = {};
    ALL_QUESTIONS.forEach(function (q) { var e = examOf(q); counts[e] = (counts[e] || 0) + 1; });
    var any = counts.tianjin > 0 || counts.jilin > 0;
    bar.hidden = !any;
    if (!any) return;
    $("scope-guokao").hidden = counts.guokao === 0;
    $("scope-tianjin").hidden = counts.tianjin === 0;
    $("scope-jilin").hidden = counts.jilin === 0;
    var cur = scopeExam();
    $("scope-guokao").classList.toggle("on", cur === "guokao");
    $("scope-tianjin").classList.toggle("on", cur === "tianjin");
    $("scope-jilin").classList.toggle("on", cur === "jilin");
  }

  function switchScope(ex) {
    if (scopeExam() === ex) return;
    store.examScope = ex;
    saveStore();
    renderHome();
    toast(ex === "tianjin" ? "已切换到天津市考题库" : ex === "jilin" ? "已切换到吉林省考题库" : "已切换到国考题库");
  }

  function renderHome() {
    renderScopeBar();
    renderOverview();
    renderDailyCard();

    var box = $("module-cards");
    box.innerHTML = "";
    MODULES.forEach(function (m) {
      var qs = scopedPool().filter(function (q) { return q.module === m.key; });
      var total = qs.length;
      var done = 0, right = 0, wrong = 0, wrongN = 0;
      qs.forEach(function (q) {
        var s = store.stats[q.id];
        if (s) {
          done += 1;
          right += s.right;
          wrong += s.wrong;
        }
        if (store.wrong[q.id]) wrongN += 1;
      });

      var acc = (right + wrong) > 0
        ? '<span class="accuracy">正确率 ' + Math.round(right * 100 / (right + wrong)) + "%</span>"
        : "";
      var card = document.createElement("button");
      card.className = "module-card";
      card.innerHTML =
        '<div class="module-zi">' + m.zi + "</div>" +
        '<div class="module-name">' + MODULE_SHORT[m.key] + "</div>" +
        '<div class="module-desc">' + m.desc + "</div>" +
        '<div class="module-meta"><span>共 ' + total + " 题 · 已做 " + done + "</span>" +
        acc +
        (wrongN ? '<span class="has-wrong">错题 ' + wrongN + " 道</span>" : "<span>　</span>") +
        "</div>" +
        '<div class="module-bar"><i style="width:' + (total ? Math.round(done * 100 / total) : 0) + '%"></i></div>';
      card.title = m.key + "：共 " + total + " 题，已做 " + done + " 题 · 查看题目列表";
      card.addEventListener("click", function () { openCatalog(m.key); });
      box.appendChild(card);
    });

    // 申论模块卡：归属当前考试范围（国考申论 / 天津申论），范围内无申论题时不渲染
    var slQs = scopedPool().filter(isShenlun);
    if (slQs.length) {
      var slCard = document.createElement("button");
      slCard.className = "module-card module-card-shenlun";
      slCard.innerHTML =
        '<div class="module-zi">论</div>' +
        '<div class="module-name">申论</div>' +
        '<div class="module-desc">主观题 · 看答案学思路</div>' +
        '<div class="module-meta"><span>共 ' + slQs.length + " 题</span><span>　</span></div>" +
        '<div class="module-bar"><i style="width:0%"></i></div>';
      slCard.title = "申论：共 " + slQs.length + " 题 · 学习模式，对照参考答案";
      slCard.addEventListener("click", function () { openCatalog(SHENLUN); });
      box.appendChild(slCard);
    }

    updateHomeBadge();
  }

  function updateHomeBadge() {
    var ex = scopeExam();
    var n = Object.keys(store.wrong).filter(function (id) {
      var q = ALL_QUESTIONS.find(function (x) { return x.id === id; });
      return q && examOf(q) === ex;
    }).length;
    var badge = $("wrong-badge");
    badge.textContent = n;
    badge.hidden = n === 0;
    var f = Object.keys(store.favorites || {}).filter(function (id) {
      var q = ALL_QUESTIONS.find(function (x) { return x.id === id; });
      return q && examOf(q) === ex;
    }).length;
    var fb = $("fav-badge");
    fb.textContent = f;
    fb.hidden = f === 0;
  }

  // ---------- 统计页：每日做题量 + 累计 ----------
  var WEEK_LABEL = ["日", "一", "二", "三", "四", "五", "六"];

  function renderStats() {
    // 近 7 天柱状图（含今天）
    var week = $("stats-week");
    week.innerHTML = "";
    var days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    var max = 1;
    days.forEach(function (d) {
      var c = store.days[fmtDate(d)] || 0;
      if (c > max) max = c;
    });
    days.forEach(function (d) {
      var c = store.days[fmtDate(d)] || 0;
      var col = document.createElement("div");
      col.className = "st-col" + (c ? "" : " zero") + (fmtDate(d) === todayStr ? " today" : "");
      col.innerHTML =
        '<span class="st-num">' + (c || "") + "</span>" +
        '<span class="st-bar"><i style="height:' + Math.max(4, Math.round(c * 100 / max)) + '%"></i></span>' +
        '<span class="st-day">' + (fmtDate(d) === todayStr ? "今" : WEEK_LABEL[d.getDay()]) + "</span>";
      week.appendChild(col);
    });

    // 累计：历史总做题次数 / 累计天数 / 总正确率（全范围合并，不只当前范围）
    var totalDone = 0, activeDays = 0, right = 0, wrong = 0;
    Object.keys(store.days).forEach(function (k) {
      if (store.days[k] > 0) activeDays += 1;
      totalDone += store.days[k];
    });
    Object.keys(store.stats).forEach(function (id) {
      right += store.stats[id].right;
      wrong += store.stats[id].wrong;
    });
    var acc = (right + wrong) > 0 ? Math.round(right * 100 / (right + wrong)) + "%" : "—";
    function item(cls, html, label) {
      return '<div class="ov-item ' + cls + '"><div class="ov-num">' + html +
        '</div><div class="ov-label">' + label + "</div></div>";
    }
    $("stats-total").innerHTML =
      item("", totalDone + '<span class="unit">题</span>', "累计练习") +
      item("", activeDays + '<span class="unit">天</span>', "活跃天数") +
      item("acc", acc, "总正确率");

    // 模块掌握度：五模块正确率横条（当前考试范围），最低且 <80% 标「薄弱」，点击直达卷目
    var mBox = $("stats-mastery");
    if (mBox) {
      mBox.innerHTML = "";
      var weakest = null;
      var rows = [];
      MODULES.forEach(function (m) {
        var r = 0, w = 0, attempted = 0;
        scopedPool().forEach(function (q) {
          if (q.module !== m.key) return;
          var s = store.stats[q.id];
          if (s) { attempted += 1; r += s.right; w += s.wrong; }
        });
        var tot = r + w;
        var acc = tot ? Math.round(r * 100 / tot) : -1;
        if (acc >= 0 && (!weakest || acc < weakest.acc)) weakest = { key: m.key, acc: acc };
        rows.push({ zi: m.zi, name: MODULE_SHORT[m.key], key: m.key, acc: acc, attempted: attempted });
      });
      rows.forEach(function (row) {
        var el = document.createElement("button");
        el.className = "mastery-row" + (row.acc >= 0 && row.acc < 60 ? " weak" : "");
        el.innerHTML =
          '<span class="ma-zi">' + row.zi + '</span>' +
          '<span class="ma-name">' + row.name + '</span>' +
          '<span class="ma-bar"><i style="width:' + (row.acc < 0 ? 0 : row.acc) + '%"></i></span>' +
          '<span class="ma-acc">' + (row.acc < 0 ? "未测" : row.acc + "%") + '</span>' +
          (weakest && row.key === weakest.key && weakest.acc < 80 ? '<span class="ma-weak">薄弱</span>' : '');
        el.title = row.name + "掌握度 " + (row.acc < 0 ? "未测" : row.acc + "%") + " · 点击查看题目列表";
        el.addEventListener("click", function () { openCatalog(row.key); });
        mBox.appendChild(el);
      });
      if (!weakest) {
        var tip = document.createElement("div");
        tip.className = "empty-tip";
        tip.textContent = "还没有分模块的做题记录，先去练几题就能看到掌握度";
        mBox.appendChild(tip);
      }
    }

    // 活跃月份：每月做题量（小圆点热力风格，简洁列示）
    var months = {};
    Object.keys(store.days).forEach(function (k) {
      if (store.days[k] > 0) {
        var mk = k.slice(0, 7);
        months[mk] = (months[mk] || 0) + store.days[k];
      }
    });
    var mBox = $("stats-months");
    mBox.innerHTML = "";
    var mk = Object.keys(months).sort();
    if (!mk.length) {
      mBox.innerHTML = '<div class="empty-tip">还没有练习记录，去首页做题吧</div>';
    } else {
      mk.forEach(function (k) {
        var row = document.createElement("div");
        row.className = "st-month";
        row.innerHTML = '<span class="stm-name">' + k + '</span><span class="stm-bar"><i style="width:' +
          Math.max(6, Math.round(months[k] * 100 / months[mk[mk.length - 1]])) +
          '%"></i></span><span class="stm-num">' + months[k] + " 题</span>";
        mBox.appendChild(row);
      });
    }
  }

  function renderOverview() {
    var pool = scopedPool();
    var done = 0, right = 0, wrong = 0;
    pool.forEach(function (q) {
      var s = store.stats[q.id];
      if (s) {
        done += 1;
        right += s.right;
        wrong += s.wrong;
      }
    });
    var acc = (right + wrong) > 0 ? Math.round(right * 100 / (right + wrong)) + "%" : "—";

    function item(cls, html, label) {
      return '<div class="ov-item ' + cls + '"><div class="ov-num">' + html +
        '</div><div class="ov-label">' + label + "</div></div>";
    }
    $("overview").innerHTML =
      item("", pool.length + '<span class="unit">题</span>', "题库总量") +
      item("", done + '<span class="unit">题</span>', "已做题数") +
      item("acc", acc, "总正确率");

    renderPunchStrip();
  }

  // 首页打卡条：今日已练 + 连续天数（断一天即断签，重新计）
  function streakDays() {
    var n = 0;
    var d = new Date();
    // 今天还没练：从昨天起算连续（今天不计数，保持激励）；今天已练：从今天起算
    if (!(store.days[fmtDate(d)] > 0)) d.setDate(d.getDate() - 1);
    while (store.days[fmtDate(d)] > 0) {
      n += 1;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  function renderPunchStrip() {
    var strip = $("punch-strip");
    if (!strip) return;
    var n = store.todayCount;
    var goal = 30;
    var streak = streakDays();
    strip.hidden = false;
    strip.innerHTML =
      '<span class="punch-item">今日已练 <b>' + n + '</b> 题</span>' +
      '<span class="punch-bar"><i style="width:' + Math.min(100, Math.round(n * 100 / goal)) + '%"></i></span>' +
      '<span class="punch-item">连续 <b>' + streak + '</b> 天</span>';
  }

  // ---------- 卷目（模块总览） ----------
  var CAT_MOD = null;

  function openCatalog(modKey) {
    CAT_MOD = modKey;
    renderCatalog();
    showView("catalog");
  }

  function renderCatalog() {
    var m = null;
    MODULES.forEach(function (x) { if (x.key === CAT_MOD) m = x; });
    var qs = scopedPool().filter(function (q) { return q.module === CAT_MOD; });
    var done = 0;
    qs.forEach(function (q) { if (store.stats[q.id]) done += 1; });

    $("catalog-title").textContent = (m ? m.zi + " · " : "") + MODULE_SHORT[CAT_MOD] + "题目列表";
    var isSlCat = CAT_MOD === SHENLUN;
    $("btn-cat-practice").textContent = isSlCat ? "顺序学习" : "通练此卷";
    $("btn-sl-guide").hidden = !isSlCat;
    $("btn-cat-recite").hidden = isSlCat; // 背题模式仅行测卷目可用
    $("catalog-tip").textContent = isSlCat
      ? "共 " + qs.length + " 题 · 纯学习模式：材料、题目与参考答案同屏，不计成绩"
      : "共 " + qs.length + " 题 · 已做 " + done + " 题 · 点击题目从该题开始练习，左右滑动切换";

    var list = $("catalog-list");
    list.innerHTML = "";
    // 按卷别分组（剥离 source 里的题号后缀，如「· 第61题」）；保持题库引入顺序即年份序
    var groups = [];
    var bySource = {};
    qs.forEach(function (q) {
      var src = (q.source || "其他").replace(/·?\s*第\d+题/g, "").trim() || "其他";
      if (!bySource[src]) {
        bySource[src] = { source: src, questions: [] };
        groups.push(bySource[src]);
      }
      bySource[src].questions.push(q);
    });

    var no = 0;
    groups.forEach(function (g) {
      var gDone = 0;
      g.questions.forEach(function (q) { if (store.stats[q.id]) gDone += 1; });
      var head = document.createElement("div");
      head.className = "ct-group";
      head.innerHTML = '<span class="ct-src">' + g.source + '</span><span class="ct-prog">' +
        gDone + " / " + g.questions.length + "</span>";
      list.appendChild(head);

      g.questions.forEach(function (q) {
        no += 1;
        var s = store.stats[q.id];
        var inWrong = !!store.wrong[q.id];
        var state = !s ? "none" : (inWrong || s.wrong > 0 ? "no" : "ok");
        var sealText = state === "none" ? "未做" : state === "ok" ? "答对" : "答错";
        if (isSlCat) { state = "none"; sealText = "学习"; } // 申论纯学习：无作答状态
        var risky = s && s.wrong >= 2;

        var row = document.createElement("button");
        row.className = "ct-row" + (state === "none" ? " undone" : "");
        row.innerHTML =
          '<span class="ct-no">' + no + "</span>" +
          '<span class="ct-text"></span>' +
          (risky ? '<span class="ct-chip risky">易错</span>' : "") +
          '<span class="ct-seal ' + state + '">' + sealText + "</span>";
        row.querySelector(".ct-text").textContent =
          q.question.replace(/\s+/g, " ").slice(0, 42) + (q.question.length > 42 ? "……" : "");
        row.title = q.source + " · " + (state === "none" ? "未做" : state === "ok" ? "已答对" : "曾答错");
        row.addEventListener("click", function () {
          var idx = qs.indexOf(q);
          startQuiz("module", CAT_MOD, { startIndex: idx, from: "catalog" });
        });
        list.appendChild(row);
      });
    });
  }

  // ---------- 错题本 ----------
  function renderWrongBook() {
    var list = $("wrong-list");
    list.innerHTML = "";
    var ids = Object.keys(store.wrong);
    if (ids.length === 0) {
      list.innerHTML = '<div class="empty-tip empty-tip-rich">错题本还是空的。<br>去做几道题，答错的会自动收进这里，连对 3 次自动销账。<br>现在就去 <b>随机练习</b> 热热身？</div>';
      return;
    }
    var ex = scopeExam();
    ids.forEach(function (id) {
      var q = ALL_QUESTIONS.find(function (x) { return x.id === id; });
      if (!q) return;
      if (examOf(q) !== ex) return; // 只显示当前范围的错题
      var w = store.wrong[id];
      var kps = kpsOf(q);
      var item = document.createElement("div");
      item.className = "wrong-item";
      item.innerHTML =
        '<span class="wi-seal">✗' + w.fails + "</span>" +
        '<span class="wi-main"><span class="wi-module">' + MODULE_SHORT[q.module] + " · " + q.source + "</span>" +
        '<span class="wi-text"></span>' +
        '<span class="wi-meta">错 ' + w.fails + " 次 · 连对 " + (w.rightStreak || 0) + "/3 · 最近 " + fmtRel(w.lastWrongAt) +
        (w.fails >= 2 ? '<span class="kp">易错</span>' : "") +
        (kps.length && w.fails < 2 ? '<span class="kp">' + kps[0].title + "</span>" : "") +
        "</span></span>" +
        '<button class="wi-rep">重练</button>' +
        '<button class="wi-del" title="移出错题本">✕</button>';
      item.querySelector(".wi-text").textContent = q.question.replace(/\s+/g, " ").slice(0, 60) + "……";
      item.querySelector(".wi-rep").addEventListener("click", function () {
        // 从该错题开始，按错题列表顺序连练
        var pool = scopedPool().filter(function (x) { return store.wrong[x.id]; });
        var idx = pool.findIndex(function (x) { return x.id === id; });
        startQuiz("wrong", null, { startIndex: idx < 0 ? 0 : idx, from: "wrong" });
      });
      item.querySelector(".wi-del").addEventListener("click", function () {
        delete store.wrong[id];
        saveStore();
        renderWrongBook();
        updateHomeBadge();
      });
      list.appendChild(item);
    });
  }

  // ---------- 收藏本 ----------
  function renderFavBook() {
    var list = $("fav-list");
    list.innerHTML = "";
    var ids = Object.keys(store.favorites);
    if (ids.length === 0) {
      list.innerHTML = '<div class="empty-tip">收藏本还是空的，做题时点 ☆ 收藏喜欢的题吧</div>';
      return;
    }
    var ex = scopeExam();
    ids.forEach(function (id) {
      var q = ALL_QUESTIONS.find(function (x) { return x.id === id; });
      if (!q) return;
      if (examOf(q) !== ex) return; // 只显示当前范围的收藏
      var item = document.createElement("div");
      item.className = "wrong-item fav-item";
      item.innerHTML =
        '<span class="wi-seal fav">★</span>' +
        '<span class="wi-main"><span class="wi-module">' + MODULE_SHORT[q.module] + " · " + q.source + "</span>" +
        '<span class="wi-text"></span>' +
        (store.notes[id] ? '<span class="wi-meta">有备注</span>' : "") +
        "</span>" +
        '<button class="wi-rep">重练</button>' +
        '<button class="wi-del" title="取消收藏">✕</button>';
      item.querySelector(".wi-text").textContent = q.question.replace(/\s+/g, " ").slice(0, 60) + "……";
      item.querySelector(".wi-rep").addEventListener("click", function () {
        var pool = scopedPool().filter(function (x) { return store.favorites[x.id]; });
        var idx = pool.findIndex(function (x) { return x.id === id; });
        startQuiz("fav", null, { startIndex: idx < 0 ? 0 : idx, from: "fav" });
      });
      item.querySelector(".wi-del").addEventListener("click", function () {
        delete store.favorites[id];
        saveStore();
        renderFavBook();
        updateHomeBadge();
      });
      list.appendChild(item);
    });
  }

  // ---------- 键盘快捷键 ----------
  document.addEventListener("keydown", function (e) {
    // 卷目页：Esc 回书房
    if (!views.catalog.hidden) {
      if (e.key === "Escape") { e.preventDefault(); showView("home"); }
      return;
    }
    // 搜题页：Esc 回首页
    if (!views.search.hidden) {
      if (e.key === "Escape") { e.preventDefault(); showView("home", true); }
      return;
    }
    if (views.quiz.hidden) return;
    // 结课小结页：回车/ESC 回书房
    if (!$("summary-wrap").hidden) {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        goHome();
      }
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!session.confirmed) {
        if (session.peeked) unpeek(); // 回车回到本题
        else if (isShenlun(session.current)) nextQuestion(); // 申论学习：回车直接下一题
        else if (session.selected !== null) confirmAnswer();
      } else {
        nextQuestion();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevQuestion();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      browseNext();
    } else if (e.key >= "1" && e.key <= "6") {
      selectOption(+e.key - 1);
    } else if (/^[a-d]$/i.test(e.key)) {
      selectOption(e.key.toUpperCase().charCodeAt(0) - 65);
    } else if (e.key === "Escape") {
      goBack();
    }
  });

  // ---------- 触屏滑动切题 ----------
  var touchX = 0, touchY = 0;
  views.quiz.addEventListener("touchstart", function (e) {
    if (!e.touches || !e.touches[0]) return;
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });
  views.quiz.addEventListener("touchend", function (e) {
    var t = (e.changedTouches && e.changedTouches[0]) || null;
    if (!t) return;
    if (e.target && (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT")) return; // 备注输入区不切题
    var dx = t.clientX - touchX;
    var dy = t.clientY - touchY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) pageTo(1); else pageTo(-1); // 左滑下一题，右滑上一题
    }
  }, { passive: true });

  // ---------- 事件绑定 ----------
  $("btn-back").addEventListener("click", goBack);
  $("btn-home").addEventListener("click", goHome);
  $("btn-home2").addEventListener("click", goHome);
  $("btn-again").addEventListener("click", function () {
    startQuiz(session.mode, session.moduleId);
  });
  $("btn-mixed").addEventListener("click", function () { startQuiz("mixed"); });

  // 随机练习题量选择（10/20/30）
  function renderMixBar() {
    var n = store.mixCount || 10;
    [10, 20, 30].forEach(function (v) {
      var pill = $("mix-pill-" + v);
      if (pill) pill.classList.toggle("on", v === n);
    });
    var sub = $("mixed-sub");
    if (sub) sub.textContent = "五大模块随机抽 " + n + " 题";
  }
  [10, 20, 30].forEach(function (v) {
    var pill = $("mix-pill-" + v);
    if (pill) pill.addEventListener("click", function () {
      store.mixCount = v;
      saveStore();
      renderMixBar();
    });
  });
  renderMixBar();
  $("btn-wrongbook").addEventListener("click", function () {
    showView("wrong");
    renderWrongBook();
  });
  $("btn-repractice").addEventListener("click", function () { startQuiz("wrong", null, { from: "wrong" }); });
  $("btn-favbook").addEventListener("click", function () {
    showView("fav");
    renderFavBook();
  });
  $("btn-fav-practice").addEventListener("click", function () { startQuiz("fav", null, { from: "fav" }); });
  $("btn-clear-fav").addEventListener("click", function () {
    if (Object.keys(store.favorites).length === 0) { toast("收藏本已经是空的"); return; }
    if (confirm("确定清空收藏本吗？")) {
      store.favorites = {};
      saveStore();
      renderFavBook();
      updateHomeBadge();
      toast("已清空收藏本");
    }
  });
  $("btn-cat-practice").addEventListener("click", function () {
    if (CAT_MOD) startQuiz("module", CAT_MOD, { from: "catalog" });
  });
  $("btn-cat-recite").addEventListener("click", function () {
    if (CAT_MOD) startQuiz("recite", CAT_MOD, { from: "catalog" });
  });
  $("daily-card").addEventListener("click", function () {
    startQuiz("daily", null, { from: "home" });
  });

  // ---------- 数据备份：导出/导入 JSON（纯本地数据，换机前先导出） ----------
  $("btn-export").addEventListener("click", function () {
    try {
      var data = JSON.stringify(store);
      if (typeof Blob === "undefined" || typeof URL === "undefined" || !URL.createObjectURL) {
        toast("备份已生成（" + data.length + " 字节）");
        return;
      }
      var blob = new Blob([data], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "kaogong-backup-" + todayStr + ".json";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 400);
      toast("备份文件已导出，请妥善保存");
    } catch (e) {
      toast("导出失败：" + (e && e.message));
    }
  });
  $("btn-import").addEventListener("click", function () { $("import-file").click(); });
  $("import-file").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    var input = this;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var d = JSON.parse(reader.result);
        if (!d || typeof d !== "object" || !d.days || !d.stats) throw new Error("这不是本应用的备份文件");
        if (!confirm("导入将覆盖当前全部练习记录（错题/成绩/打卡），确定继续吗？")) { input.value = ""; return; }
        var base = defaultStore();
        Object.keys(base).forEach(function (k) {
          if (d[k] !== undefined) base[k] = d[k];
        });
        store = base;
        if (store.today !== todayStr) { store.today = todayStr; store.todayCount = 0; }
        if (store.dailyDate !== todayStr) { store.dailyDate = todayStr; store.dailyDone = {}; }
        saveStore();
        goHome();
        toast("备份已导入，全部记录已恢复");
      } catch (e) {
        toast("导入失败：" + (e && e.message));
      }
      input.value = "";
    };
    reader.readAsText(f);
  });
  $("btn-sl-guide").addEventListener("click", function () {
    showView("slguide");
  });

  // 底部导航：四页签直达（答题页中点导航＝先退出本轮）
  $("tab-home").addEventListener("click", function () {
    if (!views.quiz.hidden) { quitQuiz(); return; }
    if (views.home.hidden) goHome();
  });
  $("tab-stats").addEventListener("click", function () {
    if (!views.quiz.hidden) { quitQuiz(); }
    renderStats();
    showView("stats");
  });
  $("tab-wrong").addEventListener("click", function () {
    if (!views.quiz.hidden) { quitQuiz(); }
    renderWrongBook();
    showView("wrong");
  });
  $("tab-fav").addEventListener("click", function () {
    if (!views.quiz.hidden) { quitQuiz(); }
    renderFavBook();
    showView("fav");
  });
  $("btn-clear-wrong").addEventListener("click", function () {
    if (Object.keys(store.wrong).length === 0) { toast("错题本已经是空的"); return; }
    if (confirm("确定清空错题本吗？清空后不可恢复哦")) {
      store.wrong = {};
      saveStore();
      renderWrongBook();
      updateHomeBadge();
      toast("已清空错题本");
    }
  });
  $("btn-confirm").addEventListener("click", confirmAnswer);
  $("btn-peek").addEventListener("click", peekAnswer);
  $("btn-next").addEventListener("click", nextQuestion);
  $("btn-prev-q").addEventListener("click", prevQuestion);
  $("btn-next-q").addEventListener("click", browseNext);
  $("btn-fav").addEventListener("click", function () {
    var id = session.current && session.current.id;
    if (!id) return;
    if (store.favorites[id]) {
      delete store.favorites[id];
      toast("已取消收藏");
    } else {
      store.favorites[id] = 1;
      toast("已收藏，可在首页收藏本查看");
    }
    saveStore();
    var fav = !!store.favorites[id];
    this.textContent = fav ? "★" : "☆";
    this.classList.toggle("on", fav);
    updateHomeBadge();
  });
  $("note-input").addEventListener("blur", function () {
    saveCurrentNote();
    var tip = $("note-saved");
    if (session.current) {
      tip.hidden = false;
      clearTimeout(saveCurrentNote._t);
      saveCurrentNote._t = setTimeout(function () { tip.hidden = true; }, 1200);
    }
  });
  $("btn-toggle-material").addEventListener("click", function () {
    var body = $("material-body");
    var collapsed = body.classList.toggle("collapsed");
    this.textContent = collapsed ? "展开" : "收起";
  });
  $("scope-guokao").addEventListener("click", function () { switchScope("guokao"); });
  $("scope-tianjin").addEventListener("click", function () { switchScope("tianjin"); });
  $("scope-jilin").addEventListener("click", function () { switchScope("jilin"); });

  // 搜题入口 + 关键词防抖搜索 + 分享
  $("btn-open-search").addEventListener("click", openSearchView);
  $("search-input").addEventListener("input", function () {
    var v = this.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { searchQuestions(v); }, 250);
  });
  $("btn-share").addEventListener("click", doShare);

  // ---------- 搜题：关键词匹配题干+选项+来源，结果点击进单题会话 ----------
  var searchTimer = null;
  function openSearchView() {
    showView("search");
    var input = $("search-input");
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 60);
  }
  function searchQuestions(kw) {
    kw = (kw || "").trim();
    var tip = $("search-tip");
    var box = $("search-results");
    if (!kw) { tip.hidden = true; box.innerHTML = ""; return; }
    var lower = kw.toLowerCase();
    var hits = [];
    for (var i = 0; i < ALL_QUESTIONS.length && hits.length < 60; i++) {
      var q = ALL_QUESTIONS[i];
      var hay = (q.question || "") + "\n" + (q.options || []).join("\n") + "\n" + (q.source || "");
      if (hay.toLowerCase().indexOf(lower) === -1) continue;
      hits.push(q);
    }
    box.innerHTML = "";
    tip.hidden = false;
    if (!hits.length) {
      tip.textContent = "没有找到含「" + kw + "」的题目，换个关键词试试";
      return;
    }
    tip.textContent = "找到 " + hits.length + " 道相关题目" + (hits.length >= 60 ? "（仅展示前 60 条，可换个更精确的关键词）" : "");
    hits.forEach(function (q) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "search-item";
      var stem = (q.question || "").replace(/\s+/g, " ").trim();
      if (stem.length > 64) stem = stem.slice(0, 64) + "…";
      var meta = document.createElement("div");
      meta.className = "search-item-stem";
      meta.textContent = stem || "（图片题，点击查看）";
      var sub = document.createElement("div");
      sub.className = "search-item-meta";
      var scopeName = examOf(q) === "tianjin" ? "天津" : examOf(q) === "jilin" ? "吉林" : "国考";
      sub.textContent = scopeName + " · " + q.source;
      item.appendChild(meta);
      item.appendChild(sub);
      item.addEventListener("click", function () { startSingle(q, "search"); });
      box.appendChild(item);
    });
  }

  // ---------- 分享：?q=<id> 深链，微信里打开直达该题 ----------
  function shareUrlOf(q) {
    return location.origin + location.pathname + "?q=" + encodeURIComponent(q.id);
  }
  function legacyCopy(text, okMsg) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast(okMsg); }
    catch (e) { toast("复制失败，请手动复制地址栏链接"); }
    document.body.removeChild(ta);
  }
  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, function () { legacyCopy(text, okMsg); });
    } else {
      legacyCopy(text, okMsg);
    }
  }
  function doShare() {
    var q = session.current;
    if (!q) return;
    var url = shareUrlOf(q);
    var text = "来挑战这道题：" + (q.question || "").replace(/\s+/g, " ").trim().slice(0, 60);
    if (navigator.share) {
      navigator.share({ title: "考公学习 · 分享题目", text: text, url: url }).catch(function () {});
    } else {
      copyText(url, "链接已复制，去微信粘贴给朋友吧");
    }
  }

  // ---------- 启动 ----------
  renderHome();

  // ?q=<id> 深链：好友分享的题目直达（找不到则提示）
  (function () {
    var m = /[?&]q=([^&]+)/.exec(location.search);
    if (!m) return;
    var id = m[1];
    try { id = decodeURIComponent(id); } catch (e) {}
    var q = null;
    for (var i = 0; i < ALL_QUESTIONS.length; i++) {
      if (ALL_QUESTIONS[i].id === id) { q = ALL_QUESTIONS[i]; break; }
    }
    if (q) { startSingle(q, "home"); toast("好友分享的题目，答完点「完成」返回"); }
    else toast("分享的题目不存在或已下线");
  })();
})();
