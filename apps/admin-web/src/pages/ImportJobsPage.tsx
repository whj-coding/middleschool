import { useState } from "react";
import { reviewQueue, sampleMarkdownQuestion } from "../data/mockReviewQueue";
import { importMarkdownQuestion } from "../services/contentApi";

export function ImportJobsPage({ onNext }: { onNext: () => void }) {
  const [syncStatus, setSyncStatus] = useState("待同步");

  async function handleNext() {
    try {
      const question = await importMarkdownQuestion(sampleMarkdownQuestion);
      setSyncStatus(`API 同步：${question.reviewStatus}`);
    } catch {
      setSyncStatus("API 未连接：使用本地审核流");
    }
    onNext();
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">资料导入</p>
          <h2>导入任务队列</h2>
        </div>
        <span className="status">待审核</span>
      </div>
      <dl className="details-grid">
        <div>
          <dt>任务 ID</dt>
          <dd>{reviewQueue.importJob.id}</dd>
        </div>
        <div>
          <dt>来源</dt>
          <dd>{reviewQueue.importJob.sourceType}</dd>
        </div>
        <div>
          <dt>状态</dt>
          <dd>{reviewQueue.importJob.status}</dd>
        </div>
      </dl>
      <p className="note">Markdown 导入任务 import-001：待审核</p>
      <p className="sync-status">{syncStatus}</p>
      <button type="button" onClick={handleNext}>进入题目审核</button>
    </section>
  );
}
