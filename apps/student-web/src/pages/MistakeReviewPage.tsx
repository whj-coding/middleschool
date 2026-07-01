type Props = {
  reason: string;
  evidence: string;
  onReport: () => void;
};

export function MistakeReviewPage({ reason, evidence, onReport }: Props) {
  return (
    <section className="flow-stage mistake-stage">
      <div className="stage-main">
        <p className="eyebrow">错题复盘</p>
        <h1>{reason}</h1>
        <div className="evidence-panel">
          <strong>AI 定位到的证据</strong>
          <p>{evidence}</p>
        </div>

        <div className="correction-path">
          <div>
            <span className="step-index">1</span>
            <strong>先找固定费用</strong>
            <p>3 元基础服务费不随页数变化，对应 b。</p>
          </div>
          <div>
            <span className="step-index">2</span>
            <strong>再找单位变化量</strong>
            <p>每打印 1 页增加 0.4 元，对应 k。</p>
          </div>
          <div>
            <span className="step-index">3</span>
            <strong>合成表达式</strong>
            <p>总费用 y = 0.4x + 3。</p>
          </div>
        </div>

        <div className="similar-task">
          <strong>同类题建议</strong>
          <p>先写出固定费用，再写单位变化费用，最后合成 y = kx + b。</p>
        </div>

        <button className="primary" onClick={onReport}>
          生成学情报告
        </button>
      </div>

      <aside className="stage-coach">
        <h2>AI 讲解模式</h2>
        <div className="chat-card">
          <p>你的主要问题不是计算，而是建模顺序。以后看到“基础费、起步价、固定套餐费”，先把它们放到 b 的位置。</p>
        </div>
        <div className="diagnosis-panel">
          <strong>错因标签</strong>
          <div className="tag-cloud">
            <span>建模顺序错误</span>
            <span>固定量识别</span>
            <span>表达式结构</span>
          </div>
        </div>
        <button>再给我一道类似题</button>
      </aside>
    </section>
  );
}
