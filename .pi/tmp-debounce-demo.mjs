// 纯 JS 计时器实验：模拟"值变化时重新计时"这个惯用法（防抖的核心）
// 目的：证明 clearTimeout 到底做了什么、不写它会怎样。不涉及 React。
const t0 = Date.now();
const log = (msg) => console.log(`${String(Date.now() - t0).padStart(4)}ms  ${msg}`);
const DELAY = 300;

// ===== 版本 A：只 setTimeout，不清除（= 漏写清理函数）=====
const committedA = [];
function onValueChangeA(value) {
  setTimeout(() => {
    committedA.push(value);
    log(`[A 无清理] 定时器到点 → 采用「${value}」`);
  }, DELAY);
}

// ===== 版本 B：每次变化前先 clearTimeout 上一次的（= 真正的防抖）=====
let timer = null;
const committedB = [];
function onValueChangeB(value) {
  if (timer !== null) {
    clearTimeout(timer); // 关键：从定时器表里删掉上一个还没到点的任务
    log(`[B 防抖 ] 撤销上一个待定定时器，改记为「${value}」`);
  }
  timer = setTimeout(() => {
    timer = null; // 已触发，把句柄清空（避免下次误 clear 一个失效 id）
    committedB.push(value);
    log(`[B 防抖 ] 定时器到点 → 采用「${value}」`);
  }, DELAY);
}

// ===== 模拟用户输入：架(0ms) 构(120ms) 师(260ms)，然后停手 =====
[
  ['架', 0],
  ['构', 120],
  ['师', 260],
].forEach(([ch, at]) => {
  setTimeout(() => {
    log(`用户输入「${ch}」`);
    onValueChangeA(ch);
    onValueChangeB(ch);
  }, at);
});

// ===== 结算 =====
setTimeout(() => {
  log('──────────── 结果 ────────────');
  log(`A（无 clearTimeout）采用 ${committedA.length} 次 → ${JSON.stringify(committedA)}`);
  log(`B（有 clearTimeout）采用 ${committedB.length} 次 → ${JSON.stringify(committedB)}`);
  log('说明：B 只在"最后一次输入后安静满 300ms"时采用了一次 → 这就是防抖');
}, 900);
