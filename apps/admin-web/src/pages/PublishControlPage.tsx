import { useState } from "react";
import { reviewQueue } from "../data/mockReviewQueue";
import { publishQuestion } from "../services/contentApi";

export function PublishControlPage() {
  const [publishStatus, setPublishStatus] = useState("待发布");

  async function handlePublish() {
    try {
      const question = await publishQuestion(reviewQueue.question.id);
      setPublishStatus(`API 同步：${question.reviewStatus}`);
    } catch {
      setPublishStatus("API 未连接：保留待发布");
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">发布控制</p>
          <h2>发布队列</h2>
        </div>
        <span className="status approved">可发布</span>
      </div>
      <p className="rule">只有审核通过内容可以发布</p>
      <dl className="details-grid">
        <div>
          <dt>题目</dt>
          <dd>{reviewQueue.question.id}</dd>
        </div>
        <div>
          <dt>题目审核</dt>
          <dd>已通过</dd>
        </div>
        <div>
          <dt>图形识别</dt>
          <dd>已通过</dd>
        </div>
      </dl>
      <p className="sync-status">{publishStatus}</p>
      <button type="button" onClick={handlePublish}>发布到学生端</button>
    </section>
  );
}
