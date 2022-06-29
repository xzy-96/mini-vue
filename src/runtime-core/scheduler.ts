const quese: any[] = [];
let isFlushPending = false;
export function queueJops(job) {
  if (!quese.includes(job)) {
    quese.push(job);
  }
  console.log(quese, "console.log(job, quese);");
  queseFlush();
}

function queseFlush() {
  if (isFlushPending) return true;
  isFlushPending = true;

  nextTick(flushJob);
}
function flushJob() {
  let job;
  isFlushPending = false;
  while ((job = quese.shift())) {
    console.log(job, quese);
    job && job();
  }
}
const p = Promise.resolve();
export function nextTick(fn) {
  return fn ? p.then(fn) : p;
}
