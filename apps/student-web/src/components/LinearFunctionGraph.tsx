import { useState } from "react";

type Point = {
  x: number;
  y: number;
};

type LineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const graphBounds = {
  xMin: -4,
  xMax: 4,
  yMin: -3,
  yMax: 3,
};

const svgBounds = {
  xMin: 20,
  xMax: 180,
  yMin: 10,
  yMax: 130,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function within(value: number, min: number, max: number) {
  return value >= min - 0.0001 && value <= max + 0.0001;
}

function clipLineToBox(k: number, b: number): LineSegment {
  const candidates: Point[] = [];
  const { xMin, xMax, yMin, yMax } = graphBounds;

  const addPoint = (x: number, y: number) => {
    if (!within(x, xMin, xMax) || !within(y, yMin, yMax)) return;
    const exists = candidates.some((point) => Math.abs(point.x - x) < 0.0001 && Math.abs(point.y - y) < 0.0001);
    if (!exists) candidates.push({ x: clamp(x, xMin, xMax), y: clamp(y, yMin, yMax) });
  };

  addPoint(xMin, k * xMin + b);
  addPoint(xMax, k * xMax + b);

  if (Math.abs(k) > 0.0001) {
    addPoint((yMin - b) / k, yMin);
    addPoint((yMax - b) / k, yMax);
  }

  if (candidates.length < 2) {
    return {
      x1: xMin,
      y1: clamp(b, yMin, yMax),
      x2: xMax,
      y2: clamp(b, yMin, yMax),
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

function toSvgX(x: number) {
  const { xMin, xMax } = graphBounds;
  const { xMin: svgMin, xMax: svgMax } = svgBounds;
  return svgMin + ((x - xMin) / (xMax - xMin)) * (svgMax - svgMin);
}

function toSvgY(y: number) {
  const { yMin, yMax } = graphBounds;
  const { yMin: svgMin, yMax: svgMax } = svgBounds;
  return svgMax - ((y - yMin) / (yMax - yMin)) * (svgMax - svgMin);
}

export function LinearFunctionGraph() {
  const [k, setK] = useState(1);
  const [b, setB] = useState(-1);
  const formula = `y = ${k}x ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}`;
  const visibleLine = clipLineToBox(k, b);

  return (
    <section aria-label="一次函数图像">
      <h2>图像探索</h2>
      <p>{formula}</p>
      <label>
        k
        <input aria-label="k" type="number" value={k} onChange={(event) => setK(Number(event.target.value))} />
      </label>
      <label>
        b
        <input aria-label="b" type="number" value={b} onChange={(event) => setB(Number(event.target.value))} />
      </label>
      <svg viewBox="0 0 200 140" role="img" aria-label={formula}>
        <line x1="20" y1="70" x2="180" y2="70" stroke="#334155" />
        <line x1="100" y1="10" x2="100" y2="130" stroke="#334155" />
        <line
          data-testid="function-line"
          x1={toSvgX(visibleLine.x1)}
          y1={toSvgY(visibleLine.y1)}
          x2={toSvgX(visibleLine.x2)}
          y2={toSvgY(visibleLine.y2)}
          stroke="#2563eb"
          strokeWidth="3"
        />
      </svg>
    </section>
  );
}
