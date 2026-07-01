import { useMemo, useState } from "react";
import {
  BookOpen,
  ChartLine,
  CheckCircle,
  ClipboardText,
  Clock,
  Exam,
  Function,
  Graph,
  Microphone,
  Play,
  SpeakerHigh,
  Target,
  UserCircle,
  Waveform,
} from "@phosphor-icons/react";

const navItems = [
  { id: "today", label: "今日任务", icon: ClipboardText },
  { id: "linear", label: "一次函数", icon: Graph },
  { id: "mistakes", label: "错题复练", icon: Exam },
  { id: "report", label: "学情报告", icon: ChartLine },
];

const steps = [
  { id: 1, label: "函数与变量", state: "done" },
  { id: 2, label: "一次函数的定义", state: "done" },
  { id: 3, label: "k 和 b 的意义", state: "active" },
  { id: 4, label: "图像与性质", state: "next" },
  { id: 5, label: "应用与综合", state: "next" },
];

const quickQuestions = [
  "为什么 k 越大直线越陡？",
  "b 和 y 轴交点有什么关系？",
  "给我一道相似题",
];

const rangeTicks = [-5, 0, 5];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function within(value, min, max) {
  return value >= min - 0.0001 && value <= max + 0.0001;
}

function clipLineToBox(k, b, min, max) {
  const candidates = [];

  const addPoint = (x, y) => {
    if (!within(x, min, max) || !within(y, min, max)) return;
    const exists = candidates.some((point) => Math.abs(point.x - x) < 0.0001 && Math.abs(point.y - y) < 0.0001);
    if (!exists) candidates.push({ x: clamp(x, min, max), y: clamp(y, min, max) });
  };

  addPoint(min, k * min + b);
  addPoint(max, k * max + b);

  if (Math.abs(k) > 0.0001) {
    addPoint((min - b) / k, min);
    addPoint((max - b) / k, max);
  }

  if (candidates.length < 2) {
    return {
      x1: min,
      y1: clamp(b, min, max),
      x2: max,
      y2: clamp(b, min, max),
    };
  }

  let bestPair = [candidates[0], candidates[1]];
  let bestDistance = -1;
  for (let i = 0; i < candidates.length; i += 1) {
    for (let j = i + 1; j < candidates.length; j += 1) {
      const dx = candidates[i].x - candidates[j].x;
      const dy = candidates[i].y - candidates[j].y;
      const distance = dx * dx + dy * dy;
      if (distance > bestDistance) {
        bestDistance = distance;
        bestPair = [candidates[i], candidates[j]];
      }
    }
  }

  return {
    x1: bestPair[0].x,
    y1: bestPair[0].y,
    x2: bestPair[1].x,
    y2: bestPair[1].y,
  };
}

function LineGraph({ k, b }) {
  const width = 420;
  const height = 300;
  const pad = 34;
  const min = -5;
  const max = 5;
  const range = max - min;

  const toX = (x) => pad + ((x - min) / range) * (width - pad * 2);
  const toY = (y) => height - pad - ((y - min) / range) * (height - pad * 2);

  const visibleLine = clipLineToBox(k, b, min, max);
  const pointX = 0;
  const pointY = b;

  const grid = Array.from({ length: 11 }, (_, index) => index - 5);

  return (
    <svg className="graph" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="一次函数 y = kx + b 图像">
      <rect className="graph-bg" x="0" y="0" width={width} height={height} rx="8" />
      {grid.map((tick) => (
        <g key={`grid-${tick}`}>
          <line className="grid-line" x1={toX(tick)} x2={toX(tick)} y1={pad} y2={height - pad} />
          <line className="grid-line" x1={pad} x2={width - pad} y1={toY(tick)} y2={toY(tick)} />
        </g>
      ))}
      <line className="axis" x1={pad} x2={width - pad} y1={toY(0)} y2={toY(0)} />
      <line className="axis" x1={toX(0)} x2={toX(0)} y1={pad} y2={height - pad} />
      {grid.map((tick) => (
        <g key={`tick-${tick}`}>
          {tick !== 0 && (
            <>
              <text className="tick-label" x={toX(tick)} y={toY(0) + 18} textAnchor="middle">
                {tick}
              </text>
              <text className="tick-label" x={toX(0) - 10} y={toY(tick) + 4} textAnchor="end">
                {tick}
              </text>
            </>
          )}
        </g>
      ))}
      <text className="axis-label" x={width - pad + 16} y={toY(0) + 4}>
        x
      </text>
      <text className="axis-label" x={toX(0) + 8} y={pad - 12}>
        y
      </text>
      <line
        className="function-line"
        x1={toX(visibleLine.x1)}
        x2={toX(visibleLine.x2)}
        y1={toY(visibleLine.y1)}
        y2={toY(visibleLine.y2)}
      />
      <circle className="point" cx={toX(pointX)} cy={toY(clamp(pointY, min, max))} r="5" />
      <g className="legend">
        <rect x="266" y="244" width="112" height="32" rx="8" />
        <line x1="282" x2="306" y1="260" y2="260" />
        <text x="314" y="265">
          y = {k.toFixed(1)}x {b >= 0 ? `+ ${b.toFixed(1)}` : `- ${Math.abs(b).toFixed(1)}`}
        </text>
      </g>
    </svg>
  );
}

export function App() {
  const [activeNav, setActiveNav] = useState("today");
  const [duration, setDuration] = useState(20);
  const [k, setK] = useState(1.5);
  const [b, setB] = useState(-1);
  const [listening, setListening] = useState(false);
  const [coachText, setCoachText] = useState("试着调节 k 和 b 的值，观察直线有哪些变化。有发现或疑问，可以随时告诉我。");

  const insight = useMemo(() => {
    if (k > 0.2) return "k > 0，直线从左下向右上升。";
    if (k < -0.2) return "k < 0，直线从左上向右下降。";
    return "k 接近 0，直线变化很平缓。";
  }, [k]);

  const slopeNote = useMemo(() => {
    if (Math.abs(k) >= 2.5) return "|k| 较大，直线更陡。";
    if (Math.abs(k) <= 0.7) return "|k| 较小，直线更平缓。";
    return "|k| 适中，观察增减性会比较清楚。";
  }, [k]);

  function handleQuestion(question) {
    setCoachText(
      question === "给我一道相似题"
        ? "相似题：某打印店收取 3 元基础服务费，每打印 1 页加 0.4 元。请写出总费用 y 与页数 x 的关系式。"
        : "你可以先看两个量：k 决定每增加 1 个 x，y 改变多少；b 决定 x = 0 时直线从 y 轴哪里开始。"
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="主导航">
        <div className="brand">
          <div className="brand-mark">
            <Function size={30} weight="bold" />
          </div>
          <div>
            <strong>AI 数学学习教练</strong>
            <span>初三</span>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeNav === item.id ? "active" : ""}`}
                onClick={() => setActiveNav(item.id)}
              >
                <Icon size={22} weight={activeNav === item.id ? "fill" : "regular"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="student-card">
          <UserCircle size={40} weight="fill" />
          <div>
            <strong>张同学</strong>
            <span>初三（2）班</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="page-header">
          <div>
            <span className="eyebrow">今日任务</span>
            <h1>理解 k 和 b 的意义</h1>
          </div>
          <div className="goal-pill">
            <Target size={18} weight="fill" />
            中考目标 110+
          </div>
        </header>

        <section className="content-grid">
          <div className="main-column">
            <article className="surface task-panel">
              <div className="section-title">
                <span className="title-icon">
                  <CheckCircle size={22} weight="fill" />
                </span>
                <div>
                  <strong>今日推荐任务</strong>
                  <span>一次函数 · 核心概念</span>
                </div>
              </div>

              <h2>理解 k 和 b 的意义</h2>
              <p className="reason">
                根据你的学习诊断，你在“一次函数中 k 和 b 的意义”上存在理解不够深入的问题。掌握该知识点有助于后续解决一次函数的图像与性质相关题目。
              </p>

              <div className="duration-row" aria-label="预计用时">
                {[5, 10, 20, 40].map((item) => (
                  <button
                    key={item}
                    className={`duration ${duration === item ? "selected" : ""}`}
                    onClick={() => setDuration(item)}
                  >
                    <Clock size={18} />
                    {item} 分钟
                  </button>
                ))}
              </div>

              <div className="progress-area">
                <div className="progress-head">
                  <strong>学习进度 · 一次函数</strong>
                  <span>42%</span>
                </div>
                <div className="progress-bar">
                  <div style={{ width: "42%" }} />
                </div>
                <div className="step-row">
                  {steps.map((step) => (
                    <div key={step.id} className={`step ${step.state}`}>
                      <span>{step.state === "done" ? <CheckCircle size={16} weight="fill" /> : step.id}</span>
                      <p>{step.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="surface graph-panel">
              <div className="graph-controls">
                <div className="section-title compact">
                  <span className="title-icon soft">
                    <BookOpen size={22} weight="fill" />
                  </span>
                  <div>
                    <strong>图像探索：一次函数 y = kx + b</strong>
                    <span>{insight}</span>
                  </div>
                </div>

                <label className="slider-row">
                  <span>k（斜率）</span>
                  <strong>{k.toFixed(1)}</strong>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={k}
                    onChange={(event) => setK(Number(event.target.value))}
                  />
                  <div className="slider-ticks" aria-label="K 刻度">
                    {rangeTicks.map((tick) => (
                      <span key={`k-${tick}`}>{tick}</span>
                    ))}
                  </div>
                </label>

                <label className="slider-row blue">
                  <span>b（截距）</span>
                  <strong>{b.toFixed(1)}</strong>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={b}
                    onChange={(event) => setB(Number(event.target.value))}
                  />
                  <div className="slider-ticks" aria-label="B 刻度">
                    {rangeTicks.map((tick) => (
                      <span key={`b-${tick}`}>{tick}</span>
                    ))}
                  </div>
                </label>

                <div className="insight-box">
                  <Graph size={20} weight="fill" />
                  <p>{slopeNote} b 决定直线与 y 轴交点的位置。</p>
                </div>
              </div>

              <LineGraph k={k} b={b} />
            </article>
          </div>

          <aside className="coach-column">
            <section className="coach-card">
              <div className="coach-head">
                <div className="bot-avatar">
                  <Waveform size={30} weight="fill" />
                </div>
                <div>
                  <h2>AI 学习教练</h2>
                  <span className="online">在线</span>
                </div>
              </div>

              <div className="coach-message">
                <p>你好，张同学。</p>
                <p>今天我们一起学习“理解 k 和 b 的意义”。先通过图像探索观察 k 和 b 对直线的影响，我会在你需要时提供帮助。</p>
              </div>

              <div className="coach-note">
                <strong>在图像中，你可以发现：</strong>
                <ul>
                  <li>k 决定直线的倾斜程度和方向</li>
                  <li>k &gt; 0 时，直线从左下向右上升</li>
                  <li>k &lt; 0 时，直线从左上向右下降</li>
                  <li>b 决定直线与 y 轴的交点位置</li>
                </ul>
              </div>

              <div className="coach-response">
                <p>{coachText}</p>
              </div>

              <div className="quick-actions">
                {quickQuestions.map((question) => (
                  <button key={question} onClick={() => handleQuestion(question)}>
                    {question}
                  </button>
                ))}
              </div>

              <div className="voice-dock">
                <button className="round-button" aria-label="播放讲解">
                  <Play size={22} weight="fill" />
                  <span>播放</span>
                </button>
                <button
                  className={`mic-button ${listening ? "listening" : ""}`}
                  onClick={() => setListening((value) => !value)}
                  aria-label="按住说话"
                >
                  <Microphone size={34} weight="fill" />
                  <span>{listening ? "正在听" : "按住说话"}</span>
                </button>
                <button className="round-button" aria-label="语音设置">
                  <SpeakerHigh size={22} weight="fill" />
                  <span>语音设置</span>
                </button>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
