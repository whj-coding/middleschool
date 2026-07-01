type Props = {
  reason: string;
  evidence: string;
  onReport: () => void;
};

export function MistakeReviewPage({ reason, evidence, onReport }: Props) {
  return (
    <section className="panel">
      <p className="eyebrow">错题复盘</p>
      <h1>{reason}</h1>
      <p>{evidence}</p>
      <div className="hint-box">
        同类题建议：先写出固定费用，再写单位变化费用，最后合成 y = kx + b。
      </div>
      <button className="primary" onClick={onReport}>
        生成学情报告
      </button>
    </section>
  );
}
