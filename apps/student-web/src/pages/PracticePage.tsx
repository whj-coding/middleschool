type Props = {
  onSubmit: () => void;
};

export function PracticePage({ onSubmit }: Props) {
  return (
    <section className="panel">
      <p className="eyebrow">即时练习</p>
      <h1>打印费建模</h1>
      <p>某打印店收取 3 元基础服务费，每打印 1 页加 0.4 元。请写出总费用 y 与页数 x 的关系式。</p>
      <div className="hint-box">
        提示模式：先找固定不变的费用，再找每增加 1 页增加多少费用。
      </div>
      <button className="primary" onClick={onSubmit}>
        提交答案
      </button>
    </section>
  );
}
