/**
 * plot-utils.js — Lightweight Canvas-based math plotter
 * Renders mathematical function plots with axes, grid, curves, and fill regions.
 * Supports: explicit y=f(x), parametric, polar coordinates.
 * Fully offline, no external dependencies.
 */

/* roundRect polyfill for older browsers */
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
  };
}

/* ─── Safe Math Expression Evaluator ─── */
const MATH_FUNCS = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
  sqrt: Math.sqrt, abs: Math.abs,
  ln: Math.log, log: Math.log, log2: Math.log2, log10: Math.log10,
  exp: Math.exp, ceil: Math.ceil, floor: Math.floor,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  sign: Math.sign, max: Math.max, min: Math.min,
  pi: Math.PI, PI: Math.PI, e: Math.E
};

/**
 * Compile a math expression string into a callable function.
 * @param {string} expr - e.g. "sqrt(x+4)", "sin(x)^2"
 * @param {string} varName - variable name, default "x"
 * @returns {Function} (value) => number
 */
function compileExpr(expr, varName = 'x') {
  // Preprocess: add * for implicit multiplication like 2x, 3sin(x)
  let processed = expr
    .replace(/(\d)([a-zA-Z(])/g, '$1*$2')       // 2x → 2*x, 2(→2*(, 2sin→2*sin
    .replace(/\)(\d)/g, ')*$1')                  // )2 → )*2
    .replace(/\)([a-zA-Z])/g, ')*$1')            // )x → )*x
    .replace(/\^/g, '**');                        // ^ → **

  // Replace function names and constants with __m.name
  for (const name of Object.keys(MATH_FUNCS)) {
    const re = new RegExp(`\\b${name}\\b`, 'g');
    processed = processed.replace(re, `__m.${name}`);
  }

  try {
    return new Function(varName, '__m', `"use strict"; try { return (${processed}); } catch(e) { return NaN; }`);
  } catch {
    return () => NaN;
  }
}

/** Evaluate compiled function safely */
function evalExpr(fn, val) {
  try {
    const r = fn(val, MATH_FUNCS);
    return (Number.isFinite(r)) ? r : NaN;
  } catch { return NaN; }
}

/* ─── Color Palette ─── */
const COLORS = [
  '#6366f1', // indigo (accent)
  '#f43f5e', // rose
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
];

/* ─── Main Plot Renderer ─── */

/**
 * Render a mathematical plot on a canvas element.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} config
 * @param {Array} config.curves - Array of curve objects:
 *   { expr: "sqrt(x+4)", color?: "#f00", label?: "y = √(x+4)", dashed?: false }
 *   OR { type: "parametric", x: "cos(t)^3", y: "sin(t)^3", tRange: [0, 6.28], label: "..." }
 *   OR { type: "polar", r: "2*(1+cos(t))", tRange: [0, 6.28], label: "..." }
 * @param {Array} config.xRange - [xMin, xMax]
 * @param {Array} config.yRange - [yMin, yMax] (auto if not given)
 * @param {Array} config.fill - Fill regions: [{ between: [0, 1], color: "rgba(99,102,241,0.15)" }]
 *   OR [{ below: 0, color: "..." }] — fill between curve index and x-axis
 * @param {Array} config.points - Special points: [{ x: 0, y: 2, label: "(0,2)" }]
 * @param {string} config.title - Plot title
 * @param {boolean} config.grid - Show grid (default true)
 * @param {boolean} config.aspectEqual - Equal aspect ratio
 */
export function drawPlot(canvas, config) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width * dpr;
  const H = rect.height * dpr;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const w = rect.width;
  const h = rect.height;

  // Read theme
  const style = getComputedStyle(canvas);
  const isDark = style.getPropertyValue('--bg')?.trim()?.startsWith('#1') ||
                 style.getPropertyValue('--bg')?.trim()?.startsWith('#0') ||
                 document.body?.classList.contains('dark') ||
                 document.documentElement.getAttribute('data-theme') === 'dark';

  const colors = {
    bg: isDark ? '#1a1a2e' : '#ffffff',
    axis: isDark ? '#e2e8f0' : '#1e293b',
    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    gridMajor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
    text: isDark ? '#94a3b8' : '#64748b',
    title: isDark ? '#e2e8f0' : '#1e293b',
    fill: isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.12)',
  };

  // Parse curves
  const curves = (config.curves || []).map((c, i) => ({
    ...c,
    color: c.color || COLORS[i % COLORS.length],
    fn: c.type ? null : compileExpr(c.expr || '0', 'x'),
    fnX: c.type === 'parametric' ? compileExpr(c.x || '0', 't') : null,
    fnY: c.type === 'parametric' ? compileExpr(c.y || '0', 't') : null,
    fnR: c.type === 'polar' ? compileExpr(c.r || '0', 't') : null,
  }));

  // Compute xRange
  const pad = 0.5;
  let [xMin, xMax] = config.xRange || [-5, 5];

  // Sample all curves to get yRange if not specified
  const samples = 500;
  const allYs = [];

  const curvePoints = curves.map(c => {
    const pts = [];
    if (c.type === 'parametric') {
      const [tMin, tMax] = c.tRange || [0, 2 * Math.PI];
      for (let i = 0; i <= samples; i++) {
        const t = tMin + (tMax - tMin) * i / samples;
        const px = evalExpr(c.fnX, t);
        const py = evalExpr(c.fnY, t);
        if (!isNaN(px) && !isNaN(py)) {
          pts.push({ x: px, y: py });
          allYs.push(py);
        }
      }
    } else if (c.type === 'polar') {
      const [tMin, tMax] = c.tRange || [0, 2 * Math.PI];
      for (let i = 0; i <= samples; i++) {
        const t = tMin + (tMax - tMin) * i / samples;
        const r = evalExpr(c.fnR, t);
        if (!isNaN(r)) {
          pts.push({ x: r * Math.cos(t), y: r * Math.sin(t) });
          allYs.push(r * Math.sin(t));
        }
      }
    } else {
      for (let i = 0; i <= samples; i++) {
        const x = xMin + (xMax - xMin) * i / samples;
        const y = evalExpr(c.fn, x);
        if (!isNaN(y) && Math.abs(y) < 1e6) {
          pts.push({ x, y });
          allYs.push(y);
        }
      }
    }
    return pts;
  });

  let [yMin, yMax] = config.yRange || [
    Math.min(0, ...allYs) - pad,
    Math.max(0, ...allYs) + pad
  ];
  if (yMin === yMax) { yMin -= 1; yMax += 1; }

  // Equal aspect
  if (config.aspectEqual) {
    const xSpan = xMax - xMin;
    const ySpan = yMax - yMin;
    const aspect = w / h;
    if (xSpan / ySpan > aspect) {
      const mid = (yMin + yMax) / 2;
      const half = xSpan / aspect / 2;
      yMin = mid - half; yMax = mid + half;
    } else {
      const mid = (xMin + xMax) / 2;
      const half = ySpan * aspect / 2;
      xMin = mid - half; xMax = mid + half;
    }
  }

  // Mapping functions
  const margin = { left: 16, right: 16, top: config.title ? 28 : 12, bottom: 12 };
  const plotW = w - margin.left - margin.right;
  const plotH = h - margin.top - margin.bottom;
  const toCanvasX = (x) => margin.left + (x - xMin) / (xMax - xMin) * plotW;
  const toCanvasY = (y) => margin.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  // ─── Background ───
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);

  // ─── Grid ───
  if (config.grid !== false) {
    const tickStepX = niceStep(xMax - xMin, 8);
    const tickStepY = niceStep(yMax - yMin, 6);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // Vertical grid
    for (let x = Math.ceil(xMin / tickStepX) * tickStepX; x <= xMax; x += tickStepX) {
      const cx = toCanvasX(x);
      ctx.beginPath(); ctx.moveTo(cx, margin.top); ctx.lineTo(cx, margin.top + plotH); ctx.stroke();
    }
    // Horizontal grid
    for (let y = Math.ceil(yMin / tickStepY) * tickStepY; y <= yMax; y += tickStepY) {
      const cy = toCanvasY(y);
      ctx.beginPath(); ctx.moveTo(margin.left, cy); ctx.lineTo(margin.left + plotW, cy); ctx.stroke();
    }
  }

  // ─── Axes ───
  ctx.strokeStyle = colors.axis;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);

  // X-axis
  if (yMin <= 0 && yMax >= 0) {
    const y0 = toCanvasY(0);
    ctx.beginPath(); ctx.moveTo(margin.left, y0); ctx.lineTo(margin.left + plotW, y0); ctx.stroke();
    // Arrow
    ctx.beginPath();
    ctx.moveTo(margin.left + plotW, y0);
    ctx.lineTo(margin.left + plotW - 6, y0 - 3);
    ctx.lineTo(margin.left + plotW - 6, y0 + 3);
    ctx.fill();
    // Label
    ctx.fillStyle = colors.axis;
    ctx.font = `italic 12px -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('x', margin.left + plotW - 2, y0 - 4);
  }

  // Y-axis
  if (xMin <= 0 && xMax >= 0) {
    const x0 = toCanvasX(0);
    ctx.strokeStyle = colors.axis;
    ctx.beginPath(); ctx.moveTo(x0, margin.top); ctx.lineTo(x0, margin.top + plotH); ctx.stroke();
    // Arrow
    ctx.beginPath();
    ctx.moveTo(x0, margin.top);
    ctx.lineTo(x0 - 3, margin.top + 6);
    ctx.lineTo(x0 + 3, margin.top + 6);
    ctx.fill();
    // Label
    ctx.fillStyle = colors.axis;
    ctx.font = `italic 12px -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('y', x0 + 5, margin.top + 2);
    // Origin "0"
    if (yMin <= 0 && yMax >= 0) {
      ctx.font = `10px -apple-system, sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillStyle = colors.text;
      ctx.fillText('0', x0 - 4, toCanvasY(0) + 3);
    }
  }

  // ─── Fill Regions ───
  (config.fill || []).forEach(f => {
    ctx.fillStyle = f.color || colors.fill;
    if (f.between != null && f.between.length === 2) {
      const [i1, i2] = f.between;
      let pts1 = curvePoints[i1] || [];
      let pts2 = curvePoints[i2] || [];
      // Filter by xRange if specified
      if (f.xRange) {
        const [xFrom, xTo] = f.xRange;
        pts1 = pts1.filter(p => p.x >= xFrom - 0.01 && p.x <= xTo + 0.01);
        pts2 = pts2.filter(p => p.x >= xFrom - 0.01 && p.x <= xTo + 0.01);
      }
      if (pts1.length && pts2.length) {
        ctx.beginPath();
        pts1.forEach((p, j) => {
          const cx = toCanvasX(p.x), cy = toCanvasY(p.y);
          j === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
        });
        for (let j = pts2.length - 1; j >= 0; j--) {
          ctx.lineTo(toCanvasX(pts2[j].x), toCanvasY(pts2[j].y));
        }
        ctx.closePath();
        ctx.fill();
      }
    } else if (f.below != null) {
      const pts = curvePoints[f.below] || [];
      if (pts.length) {
        ctx.beginPath();
        const xFrom = f.xRange ? f.xRange[0] : pts[0].x;
        const xTo = f.xRange ? f.xRange[1] : pts[pts.length - 1].x;
        const filtered = pts.filter(p => p.x >= xFrom - 0.01 && p.x <= xTo + 0.01);
        filtered.forEach((p, j) => {
          const cx = toCanvasX(p.x), cy = toCanvasY(p.y);
          j === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
        });
        // Close to x-axis
        const y0c = toCanvasY(0);
        ctx.lineTo(toCanvasX(filtered[filtered.length - 1].x), y0c);
        ctx.lineTo(toCanvasX(filtered[0].x), y0c);
        ctx.closePath();
        ctx.fill();
      }
    } else if (f.enclosed != null) {
      // Fill enclosed parametric/polar curve
      const pts = curvePoints[f.enclosed] || [];
      if (pts.length) {
        ctx.beginPath();
        pts.forEach((p, j) => {
          const cx = toCanvasX(p.x), cy = toCanvasY(p.y);
          j === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
        });
        ctx.closePath();
        ctx.fill();
      }
    }
  });

  // ─── Curves ───
  curvePoints.forEach((pts, ci) => {
    const c = curves[ci];
    ctx.strokeStyle = c.color;
    ctx.lineWidth = 2;
    ctx.setLineDash(c.dashed ? [6, 4] : []);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    let drawing = false;
    pts.forEach((p, j) => {
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(p.y);
      if (cy < margin.top - 50 || cy > margin.top + plotH + 50) {
        drawing = false;
        return;
      }
      if (!drawing) { ctx.moveTo(cx, cy); drawing = true; }
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
  });

  ctx.setLineDash([]);

  // ─── Points ───
  (config.points || []).forEach(p => {
    const cx = toCanvasX(p.x);
    const cy = toCanvasY(p.y);
    ctx.fillStyle = colors.bg;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.color || COLORS[0];
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
    if (p.label) {
      ctx.fillStyle = colors.text;
      ctx.font = `10px -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(p.label, cx + 6, cy - 5);
    }
  });

  // ─── Legend ───
  const legendCurves = curves.filter(c => c.label);
  if (legendCurves.length) {
    const lx = margin.left + 8;
    let ly = margin.top + 6;
    ctx.font = `10px -apple-system, sans-serif`;
    legendCurves.forEach(c => {
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2;
      ctx.setLineDash(c.dashed ? [4, 3] : []);
      ctx.beginPath(); ctx.moveTo(lx, ly + 5); ctx.lineTo(lx + 16, ly + 5); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.label, lx + 20, ly + 5);
      ly += 14;
    });
  }

  // ─── Title ───
  if (config.title) {
    ctx.fillStyle = colors.title;
    ctx.font = `bold 13px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(config.title, w / 2, 6);
  }
}

/* ─── Helpers ─── */

function niceStep(range, maxTicks) {
  const rough = range / maxTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  let step;
  if (norm <= 1.5) step = 1;
  else if (norm <= 3) step = 2;
  else if (norm <= 7) step = 5;
  else step = 10;
  return step * mag;
}

function formatTick(v) {
  if (Math.abs(v) < 1e-10) return '0';
  if (Math.abs(v) >= 100 || (Math.abs(v) < 0.01 && v !== 0)) return v.toExponential(0);
  // Show up to 2 decimals
  const s = v.toFixed(2).replace(/\.?0+$/, '');
  return s;
}
