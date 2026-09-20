// JS/TS 传参语义实验：到底是"值传递"还是"引用传递"？
// 运行：node .pi/tmp-pass-by-demo.mjs
const log = (...a) => console.log(...a);

// ── 实验 1：函数内【重新赋值】参数 —— 会影响调用方吗？────────────────
function reassignPrimitive(x) {
  x = '被改掉了';
  return x;
}
function reassignObject(o) {
  o = { name: '新对象' }; // 只是让这个局部名字指向别处
  return o;
}

let s = '原始字符串';
let obj = { name: '原对象' };
reassignPrimitive(s);
reassignObject(obj);
log('① 重新赋值参数后：');
log('   s   =', s, '  ← 没变');
log('   obj =', JSON.stringify(obj), '  ← 也没变（引用本身是拷贝）');

// ── 实验 2：函数内【修改对象属性】—— 会影响调用方吗？──────────────────
function mutateObject(o) {
  o.name = '被就地改掉了';
}
mutateObject(obj);
log('② 就地修改属性后：');
log('   obj =', JSON.stringify(obj), '  ← 变了！（因为两个名字指向同一个堆对象）');

// ── 实验 3：React deps 的比较语义（Object.is）────────────────────────
const a1 = { id: 1 };
const a2 = { id: 1 }; // 内容完全相同的新对象
const same = a1;
log('③ Object.is（React 比较 deps 用的就是它）:');
log('   Object.is({id:1}, {id:1}) =', Object.is(a1, a2), '  ← 内容相同 ≠ 引用相同');
log('   Object.is(a1, same)       =', Object.is(a1, same), '  ← 同一个引用才相等');
log('   数组同理: [...prev] vs prev →', Object.is([1, 2], [1, 2]), '（新引用 → 触发重渲染）');

// ── 实验 4：原始类型 vs 对象在 deps 里的表现 ──────────────────────────
let count = 0;
function bump() {
  count += 1;
}
const before = count;
bump();
log('④ 原始类型是「值拷贝」，所以函数内的自增不会穿透旧的闭包：');
log('   before =', before, ' 现在 count =', count);
