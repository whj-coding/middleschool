import { useState } from "react";

export function LinearFunctionGraph() {
  const [k, setK] = useState(1);
  const [b, setB] = useState(-1);
  const formula = `y = ${k}x ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}`;

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
          x1="30"
          y1={110 - k * -3 * 10 - b * 10}
          x2="170"
          y2={110 - k * 3 * 10 - b * 10}
          stroke="#2563eb"
          strokeWidth="3"
        />
      </svg>
    </section>
  );
}
