const fs = require('fs');
const path = require('path');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

console.log('--- Fixing Practice Bundles ---');

// 1. differential-equations/exam-practice/section-01-методы.json
{
  const file = 'src/data/differential-equations/exam-practice/section-01-методы.json';
  const data = readJSON(file);
  const mathMap = {
    'em-1': '$$\\boxed{\\int R(x, \\sqrt{ax^2+bx+c})\\,dx \\implies \\text{подстановки Эйлера / тригонометрические}}$$',
    'em-2': '$$\\boxed{S = \\int |f-g|dx, \\quad V = \\pi\\int f^2 dx, \\quad L = \\int\\sqrt{1+(y\')^2}dx}$$',
    'em-3': '$$\\boxed{\\int_1^\\infty x^{-p}dx < \\infty \\iff p>1; \\quad \\int_0^1 x^{-p}dx < \\infty \\iff p<1}$$',
    'em-4': '$$\\boxed{y(x) = \\int p(x, C_1)\\,dx + C_2}$$',
    'em-5': '$$\\boxed{y_\\text{ч} = x^s e^{\\alpha x} [Q_N(x)\\cos\\beta x + T_N(x)\\sin\\beta x]}$$',
    'em-6': '$$\\boxed{y(x) = C_1(x)y_1(x) + C_2(x)y_2(x) + \\tilde{C}_1 y_1 + \\tilde{C}_2 y_2}$$'
  };
  for (const q of data.questions) {
    if (mathMap[q.id]) {
      const last = q.steps[q.steps.length - 1];
      last.math = mathMap[q.id];
    }
  }
  writeJSON(file, data);
  console.log('Fixed:', file);
}

// 2. differential-equations/midterm-1-practice/section-01-методы.json
{
  const file = 'src/data/differential-equations/midterm-1-practice/section-01-методы.json';
  const data = readJSON(file);
  const mathMap = {
    'm-1': '$$\\boxed{S = \\frac{3\\pi a^2}{8}}$$',
    'm-2': '$$\\boxed{V = \\frac{64\\pi}{3}}$$',
    'm-3': '$$\\boxed{L = \\sqrt{5} + \\frac{1}{2}\\ln(2+\\sqrt{5})}$$',
    'm-4': '$$\\boxed{p = \\frac{1}{3} < 1 \\implies \\text{интеграл сходится}}$$'
  };
  for (const q of data.questions) {
    if (mathMap[q.id]) {
      const last = q.steps[q.steps.length - 1];
      last.math = mathMap[q.id];
    }
  }
  writeJSON(file, data);
  console.log('Fixed:', file);
}

// 3. differential-equations/midterm-2-practice/section-01-методы.json
{
  const file = 'src/data/differential-equations/midterm-2-practice/section-01-методы.json';
  const data = readJSON(file);
  const mathMap = {
    'm-1': '$$\\boxed{y\'\' - y\' - 2y = 0}$$',
    'm-2': '$$\\boxed{y(x) = \\int p(x, C_1)\\,dx + C_2}$$',
    'm-3': '$$\\boxed{y(x) = C_1(x)y_1(x) + C_2(x)y_2(x)}$$',
    'm-4': '$$\\boxed{y_\\text{ч} = x^s e^{\\alpha x} Q_n(x) = \\frac{x}{4}e^{2x}}$$'
  };
  for (const q of data.questions) {
    if (mathMap[q.id]) {
      const last = q.steps[q.steps.length - 1];
      last.math = mathMap[q.id];
    }
  }
  writeJSON(file, data);
  console.log('Fixed:', file);
}

// 4. differential-equations/kr-2 and kr-2-practice
for (const dir of ['src/data/differential-equations/kr-2', 'src/data/differential-equations/kr-2-practice']) {
  const file = path.join(dir, 'section-01-методы.json');
  if (fs.existsSync(file)) {
    const data = readJSON(file);
    const mathMap = {
      'm-1': '$$\\boxed{\\int \\frac{f(x)}{h(x)}\\,dx + \\int \\frac{p(y)}{g(y)}\\,dy = C}$$',
      'm-2': '$$\\boxed{\\int \\frac{du}{\\varphi(u) - u} = \\ln|x| + C, \\quad u = \\frac{y}{x}}$$',
      'm-3': '$$\\boxed{y(x) = e^{-\\int p(x)\\,dx} \\left(\\int q(x) e^{\\int p(x)\\,dx}\\,dx + C\\right)}$$',
      'm-4': '$$\\boxed{z\' + (1-n)p(x)z = (1-n)q(x), \\quad z = y^{1-n}}$$',
      'm-5': '$$\\boxed{F(x,y) = \\int M(x,y)\\,dx + \\varphi(y) = C}$$'
    };
    for (const q of data.questions) {
      if (mathMap[q.id]) {
        const last = q.steps[q.steps.length - 1];
        last.math = mathMap[q.id];
      }
    }
    writeJSON(file, data);
    console.log('Fixed:', file);
  }
}

// 5. differential-equations/kr-1
// 5a. section-01-методы.json
{
  const file = 'src/data/differential-equations/kr-1/section-01-методы.json';
  const data = readJSON(file);
  const mathMap = {
    'm-1': '$$\\boxed{\\int f(g(x))g\'(x)\\,dx = \\int f(t)\\,dt = F(g(x)) + C}$$',
    'm-2': '$$\\boxed{\\int u\\,dv = uv - \\int v\\,du}$$',
    'm-3': '$$\\boxed{\\int\\frac{px+q}{ax^2+bx+c}dx = \\frac{p}{2a}\\ln|ax^2+bx+c| + \\frac{\\beta}{a k}\\arctan\\frac{x+b/(2a)}{k} + C}$$',
    'm-4': '$$\\boxed{\\int \\frac{P(x)}{Q(x)}\\,dx = \\int \\text{Pol}(x)\\,dx + \\sum \\int \\frac{A_k}{(x-a)^k}\\,dx + \\sum \\int \\frac{M_j x + N_j}{(x^2+px+q)^j}\\,dx}$$',
    'm-5': '$$\\boxed{t = \\tan\\frac{x}{2}: \\quad \\sin x = \\frac{2t}{1+t^2}, \\quad \\cos x = \\frac{1-t^2}{1+t^2}, \\quad dx = \\frac{2\\,dt}{1+t^2}}$$',
    'm-6': '$$\\boxed{t = \\sqrt[n]{\\frac{ax+b}{cx+d}} \\implies \\text{рационализация интеграла}}$$'
  };
  for (const q of data.questions) {
    if (mathMap[q.id]) {
      const last = q.steps[q.steps.length - 1];
      last.math = mathMap[q.id];
    }
    if (q.id === 'm-4') {
      for (const step of q.steps) {
        if (step.text && step.text.includes('аналогично')) {
          step.text = step.text.replace('Кратный квадратичный: аналогично до степени $m$', 'Кратный квадратичный $(x^2+px+q)^m$: $\\sum_{j=1}^m \\frac{B_j x + C_j}{(x^2+px+q)^j}$');
        }
      }
    }
  }
  writeJSON(file, data);
  console.log('Fixed:', file);
}

// 5b. section-02-задачи.json: ensure "Ответ" step with boxed is last
{
  const file = 'src/data/differential-equations/kr-1/section-02-задачи.json';
  const data = readJSON(file);
  const badIds = ['1.1', '1.4', '1.6', '2.5', '2.6', '4.2', '2.7', '2.8', '3.3', '4.3', '4.4'];
  for (const q of data.questions) {
    if (badIds.includes(q.id)) {
      const ansIdx = q.steps.findIndex(s => s.math && s.math.includes('\\boxed{'));
      if (ansIdx !== -1 && ansIdx < q.steps.length - 1) {
        const [ansStep] = q.steps.splice(ansIdx, 1);
        q.steps.push(ansStep);
      }
    }
  }
  writeJSON(file, data);
  console.log('Fixed:', file);
}

// 5c. section-03-доп-задачи.json: unique step texts
{
  const file = 'src/data/differential-equations/kr-1/section-03-доп-задачи.json';
  const data = readJSON(file);
  const mapDesc = {
    'Д2.15': {
      1: 'Берём по частям первый раз: $u = \\ln^2 x$, $dv = \\frac{dx}{x^2}$, откуда $du = \\frac{2\\ln x}{x}dx$, $v = -\\frac{1}{x}$:',
      2: 'Берём по частям второй раз для оставшегося интеграла: $u = \\ln x$, $dv = \\frac{dx}{x^2}$:'
    },
    'Д3.1': {
      1: 'Выделяем полный квадрат в квадратном трёхчлене знаменателя:',
      2: 'Используем табличный интеграл для арктангенса $\\int \\frac{du}{u^2+a^2} = \\frac{1}{a}\\arctan\\frac{u}{a} + C$:'
    },
    'Д3.2': {
      1: 'Выделяем полный квадрат под корнем в знаменателе:',
      2: 'Используем формулу «длинного» логарифма $\\int \\frac{du}{\\sqrt{u^2+a^2}} = \\ln|u+\\sqrt{u^2+a^2}| + C$:'
    },
    'Д3.3': {
      1: 'Выделяем в числителе производную знаменателя $(x^2+4x+8)\' = 2x+4$:',
      2: 'Интегрируем полученные слагаемые — логарифм и арктангенс:'
    },
    'Д3.4': {
      1: 'Выделяем полный квадрат под знаком квадратного корня:',
      2: 'Применяем табличный интеграл для арксинуса $\\int \\frac{du}{\\sqrt{a^2-u^2}} = \\arcsin\\frac{u}{a} + C$:'
    },
    'Д3.5': {
      1: 'Выделяем полный квадрат в знаменателе дроби:',
      2: 'Применяем табличный интеграл арктангенса для канонического вида:'
    },
    'Д3.8': {
      1: 'Выделяем производную подкоренного выражения $(x^2-2x+5)\' = 2x-2$ в числителе:',
      2: 'Первое слагаемое интегрируем подведением, второе — по формуле «длинного» логарифма:'
    },
    'Д3.10': {
      1: 'Выделяем полный квадрат под знаком квадратного корня:',
      2: 'Применяем табличную формулу для арксинуса от нормированной переменной:'
    },
    'Д4.8': {
      1: 'Применяем тригонометрическую подстановку $x = \\tan t$ для понижения степени:',
      2: 'Интегрируем полученное тригонометрическое выражение с понижением степени и возвращаемся к $x$:'
    },
    'Д5.2': {
      1: 'Отщепляем $\\sin x\\,dx = -d(\\cos x)$ и выражаем $\\sin^2 x = 1 - \\cos^2 x$:',
      2: 'Интегрируем полученный многочлен относительно $\\cos x$:'
    }
  };
  for (const q of data.questions) {
    if (mapDesc[q.id]) {
      for (const [idxStr, textVal] of Object.entries(mapDesc[q.id])) {
        const idx = parseInt(idxStr);
        if (q.steps[idx]) {
          q.steps[idx].text = textVal;
        }
      }
    }
  }
  writeJSON(file, data);
  console.log('Fixed:', file);
}

// 6. linear-algebra/exam-practice/section-01-методы.json
{
  const file = 'src/data/linear-algebra/exam-practice/section-01-методы.json';
  const data = readJSON(file);
  const mathMap = {
    'm-1': '$$\\boxed{D = T^{-1}AT = \\operatorname{diag}(\\lambda_1, \\ldots, \\lambda_n)}$$',
    'm-2': '$$\\boxed{\\Delta_k > 0 \\; (\\forall k) \\iff A > 0; \\quad (-1)^k \\Delta_k > 0 \\iff A < 0}$$',
    'm-3': '$$\\boxed{\\Delta = AC - B^2 > 0, \\; A > 0 \\implies \\min; \\quad \\Delta > 0, \\; A < 0 \\implies \\max}$$',
    'm-4': '$$\\boxed{L(x,y,\\lambda) = f(x,y) + \\lambda g(x,y), \\quad \\nabla L = 0}$$',
    'm-5': '$$\\boxed{\\vec{n} = (f_x\', f_y\', -1) \\quad \\text{или} \\quad \\vec{n} = \\nabla F = (F_x\', F_y\', F_z\')}$$',
    'm-6': '$$\\boxed{dz = -\\frac{F_x\'}{F_z\'}dx - \\frac{F_y\'}{F_z\'}dy, \\quad \\Delta z \\approx dz}$$',
    'm-7': '$$\\boxed{\\frac{\\partial f}{\\partial \\vec{l}} = (\\nabla f, \\vec{l}_0) = \\frac{\\nabla f \\cdot \\vec{l}}{|\\vec{l}|}, \\quad \\max \\frac{\\partial f}{\\partial \\vec{l}} = |\\nabla f|}$$'
  };
  for (const q of data.questions) {
    if (mathMap[q.id]) {
      const last = q.steps[q.steps.length - 1];
      last.math = mathMap[q.id];
    }
  }
  writeJSON(file, data);
  console.log('Fixed:', file);
}

// 7. physics/exam-practice/section-01-методы.json
{
  const file = 'src/data/physics/exam-practice/section-01-методы.json';
  const data = readJSON(file);
  const mathMap = {
    'm-5': '$$\\boxed{A_{\\text{рез}} = \\frac{Qf_0}{\\omega_0^2}, \\quad \\Omega_{\\text{рез}} = \\sqrt{\\omega_0^2 - 2\\beta^2}}$$',
    'm-6': '$$\\boxed{x_{\\text{уз}} = (2n+1)\\frac{\\lambda}{4}, \\quad x_{\\text{пуч}} = n\\frac{\\lambda}{2}, \\quad \\Delta x = \\frac{\\lambda}{2}}$$',
    'm-8': '$$\\boxed{A = \\int_{V_1}^{V_2} p\\,dV, \\quad \\Delta U = \\nu C_V \\Delta T, \\quad Q = \\Delta U + A}$$'
  };
  for (const q of data.questions) {
    if (mathMap[q.id]) {
      const last = q.steps[q.steps.length - 1];
      last.math = mathMap[q.id];
    }
    if (q.id === 'm-8') {
      for (const step of q.steps) {
        if (step.text && step.text.includes('≈')) {
          step.text = step.text.replace(/≈/g, '$\\approx$');
        }
      }
    }
  }
  writeJSON(file, data);
  console.log('Fixed:', file);
}

// 8. physics/midterm-1-practice/section-01-методы.json
{
  const file = 'src/data/physics/midterm-1-practice/section-01-методы.json';
  const data = readJSON(file);
  const mathMap = {
    'm-2': '$$\\boxed{E = \\frac{mv^2}{2}\\left(1 + \\frac{I}{mR^2}\\right) + mgh = \\text{const}}$$',
    'm-3': '$$\\boxed{I_{\\text{сист}} = \\sum_{i} (I_{Ci} + m_i d_i^2)}$$',
    'm-4': '$$\\boxed{\\Delta E = \\frac{I_2\\omega_2^2}{2} - \\frac{I_1\\omega_1^2}{2}}$$',
    'm-7': '$$\\boxed{A_{\\text{рез}} = \\frac{Q f_0}{\\omega_0^2}, \\quad \\Omega_{\\text{рез}} = \\sqrt{\\omega_0^2 - 2\\beta^2}}$$'
  };
  for (const q of data.questions) {
    if (mathMap[q.id]) {
      const last = q.steps[q.steps.length - 1];
      last.math = mathMap[q.id];
    }
  }
  writeJSON(file, data);
  console.log('Fixed:', file);
}

// 9. physics/midterm-2-practice/section-01-методы.json
{
  const file = 'src/data/physics/midterm-2-practice/section-01-методы.json';
  const data = readJSON(file);
  const mathMap = {
    'm-1': '$$\\boxed{\\langle w \\rangle = \\frac{1}{2}\\rho A^2\\omega^2, \\quad \\langle I \\rangle = \\langle w \\rangle v_{\\text{ф}}}$$',
    'm-2': '$$\\boxed{\\nu_n = \\frac{nv}{2L}, \\quad \\lambda_n = \\frac{2L}{n} \\quad (n=1,2,3\\ldots)}$$',
    'm-3': '$$\\boxed{Q = \\Delta U + A, \\quad \\Delta U = \\nu C_V \\Delta T}$$',
    'm-6': '$$\\boxed{v = \\frac{v_1 + v_2}{1 + v_1 v_2 / c^2}}$$',
    'm-7': '$$\\boxed{U = \\frac{i}{2}\\nu RT, \\quad \\bar{l} = \\frac{kT}{\\sqrt{2}\\pi d^2 p}}$$'
  };
  for (const q of data.questions) {
    if (mathMap[q.id]) {
      const last = q.steps[q.steps.length - 1];
      last.math = mathMap[q.id];
    }
    if (q.id === 'm-3') {
      for (const step of q.steps) {
        if (step.text && step.text.includes('$ΔU$')) {
          step.text = step.text.replace(/\$ΔU\$/g, '$\\Delta U$');
        }
      }
    }
  }
  writeJSON(file, data);
  console.log('Fixed:', file);
}

console.log('All practice methods and tasks updated successfully!');
