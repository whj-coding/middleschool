import { useState } from "react";
import { reviewQueue } from "../data/mockReviewQueue";
import { approveQuestion } from "../services/contentApi";

export function QuestionReviewPage({ onNext }: { onNext: () => void }) {
  const [syncStatus, setSyncStatus] = useState("待同步");

  async function handleApprove() {
    try {
      const question = await approveQuestion(reviewQueue.question.id);
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
          <p className="eyebrow">题目审核</p>
          <h2>{reviewQueue.question.id}</h2>
        </div>
        <span className="status">待审核</span>
      </div>
      <div className="review-block">
        <h3>题干</h3>
        <p>{reviewQueue.question.stem}</p>
      </div>
      <div className="review-grid">
        <div className="review-block">
          <h3>答案</h3>
          <p>{reviewQueue.question.answer}</p>
        </div>
        <div className="review-block">
          <h3>解析</h3>
          <p>{reviewQueue.question.explanation}</p>
        </div>
      </div>
      <div className="tag-row" aria-label="题目标签">
        {reviewQueue.question.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <p className="sync-status">{syncStatus}</p>
      <button type="button" onClick={handleApprove}>题目审核通过</button>
    </section>
  );
}
