type Props = {
  onNext: () => void;
};

export function InitialDiagnosticPage({ onNext }: Props) {
  return (
    <section className="panel">
      <p className="eyebrow">简短诊断</p>
      <h1>10-15 道题判断从哪里开始</h1>
      <p>这里先用一次函数相关能力做样例：概念、表达式、图像、应用建模和综合迁移。</p>
      <div className="diagnostic-card">
        <strong>样例题 1 / 12</strong>
        <p>如果 y 随 x 每增加 1 固定增加 2，这类关系可能是什么函数？</p>
      </div>
      <button className="primary" onClick={onNext}>
        完成诊断
      </button>
    </section>
  );
}
