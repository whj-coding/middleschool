import { report } from "../data/mockLearning";

export function ReportPage() {
  return (
    <section className="flow-stage report-stage">
      <div className="stage-main">
        <p className="eyebrow">学情报告</p>
        <h1>本次学习反馈</h1>
        <div className="report-hero">
          <div>
            <strong>完成情况</strong>
            <p>完成 1 个图像探索、1 道即时练习、1 次错因复盘。</p>
          </div>
          <div className="report-score">42%</div>
        </div>

        <div className="report-grid">
          <article>
            <strong>进步点</strong>
            <p>{report.progress}</p>
          </article>
          <article>
            <strong>当前薄弱点</strong>
            <p>{report.weakPoint}</p>
          </article>
          <article>
            <strong>主要错因</strong>
            <p>容易把固定费用和单位变化费用写反。</p>
          </article>
          <article>
            <strong>错题复练</strong>
            <p>建议先做 3 道打印费和套餐费用建模题。</p>
          </article>
        </div>

        <div className="next-task">
          <strong>下一步任务</strong>
          <span>{report.nextTask}</span>
        </div>
      </div>

      <aside className="stage-coach">
        <h2>AI 总结</h2>
        <div className="chat-card">
          <p>你已经能看出图像上 k 和 b 的作用。下一步要把它迁移到生活建模题里，尤其是“固定费用 + 单位变化量”的识别。</p>
        </div>
        <div className="knowledge-review">
          <strong>推荐原因</strong>
          <div className="knowledge-cards">
            <span>应用建模 · 需加强</span>
            <span>表达式结构 · 基础稳定</span>
          </div>
        </div>
        <button className="primary">开始推荐练习</button>
      </aside>
    </section>
  );
}
