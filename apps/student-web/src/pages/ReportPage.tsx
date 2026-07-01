import { report } from "../data/mockLearning";

export function ReportPage() {
  return (
    <section className="panel">
      <p className="eyebrow">学情报告</p>
      <h1>本次学习反馈</h1>
      <p>{report.progress}</p>
      <p>{report.weakPoint}</p>
      <div className="next-task">
        <strong>下一步任务</strong>
        <span>{report.nextTask}</span>
      </div>
    </section>
  );
}
