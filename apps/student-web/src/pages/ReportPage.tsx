import { useEffect, useState } from "react";
import { report } from "../data/mockLearning";
import { fetchLatestReport, type LatestReport } from "../services/reportApi";
import { fetchRetryList, type RetryPracticeItem } from "../services/retryListApi";

export type ReportNextTask = {
  id: string;
  title: string;
};

type Props = {
  onRetryPractice?: (questionId: string, taskId: string | null) => void;
  onStartNextTask?: (task: ReportNextTask) => void;
};

export function ReportPage({ onRetryPractice, onStartNextTask }: Props) {
  const [retryItems, setRetryItems] = useState<RetryPracticeItem[]>([]);
  const [latestReport, setLatestReport] = useState<LatestReport | null>(null);
  const progressText = latestReport?.progress ?? report.progress;
  const weakPointText = latestReport
    ? latestReport.weakPoints.join("、") || "本次未发现明显薄弱点"
    : report.weakPoint;
  const mistakeReasonText = latestReport
    ? latestReport.mistakes[0]?.reason ?? "本次未发现主要错因"
    : "容易把固定费用和单位变化费用写反。";
  const nextTask = latestReport?.nextTask ?? { id: "task-linear-modeling", title: report.nextTask };
  const nextTaskTitle = nextTask.title;
  const taskStatusText =
    latestReport?.activeTask?.status === "completed" ? "已完成" : latestReport?.activeTask?.status === "started" ? "进行中" : "暂无任务状态";
  const summaryText =
    latestReport?.summary ?? "你已经能看出图像上 k 和 b 的作用。下一步要把它迁移到生活建模题里，尤其是固定费用和单位变化量的识别。";
  const recommendationReasons = latestReport?.recommendationReasons ?? ["应用建模 · 需加强", "表达式结构 · 基础稳定"];
  const completionText = latestReport?.completionRate !== undefined ? `${latestReport.completionRate}%` : "本次已完成";
  const completionDescription = latestReport && latestReport.mistakes.length === 0
    ? "完成本次学习任务。"
    : "完成 1 个图像探索、1 道即时练习、1 次错因复盘。";

  useEffect(() => {
    let active = true;

    fetchLatestReport("student-demo")
      .then((apiReport) => {
        if (active) setLatestReport(apiReport);
      })
      .catch(() => {
        if (active) setLatestReport(null);
      });

    fetchRetryList("student-demo")
      .then((retryList) => {
        if (active) setRetryItems(retryList.items);
      })
      .catch(() => {
        if (active) setRetryItems([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="flow-stage report-stage">
      <div className="stage-main">
        <p className="eyebrow">学情报告</p>
        <h1>本次学习反馈</h1>
        <div className="report-hero">
          <div>
            <strong>完成情况</strong>
            <p>{completionDescription}任务状态：{taskStatusText}</p>
          </div>
          <div className="report-score">{completionText}</div>
        </div>

        <div className="report-grid">
          <article>
            <strong>进步点</strong>
            <p>{progressText}</p>
          </article>
          <article>
            <strong>当前薄弱点</strong>
            <p>{weakPointText}</p>
          </article>
          <article>
            <strong>主要错因</strong>
            <p>{mistakeReasonText}</p>
          </article>
          <article>
            <strong>错题复练</strong>
            <p>建议先做 3 道打印费和套餐费用建模题。</p>
          </article>
        </div>

        <div className="next-task">
          <strong>下一步任务</strong>
          <span>{nextTaskTitle}</span>
        </div>
        {retryItems.length > 0 && (
          <div className="retry-list">
            <strong>错题复练候选</strong>
            {retryItems.map((item) => (
              <article key={`${item.questionId}-${item.createdAt}`}>
                <span>{item.questionId}</span>
                <p>上次答案：{item.studentAnswer ?? "未记录"}</p>
                <p>提示层级：{item.hintLevel}</p>
                <button onClick={() => onRetryPractice?.(item.questionId, item.taskId)}>开始复练</button>
              </article>
            ))}
          </div>
        )}
      </div>

      <aside className="stage-coach">
        <h2>AI 总结</h2>
        <div className="chat-card">
          <p>{summaryText}</p>
        </div>
        <div className="knowledge-review">
          <strong>推荐原因</strong>
          <div className="knowledge-cards">
            {recommendationReasons.map((reason) => (
              <span key={reason}>{reason}</span>
            ))}
          </div>
        </div>
        <button className="primary" onClick={() => onStartNextTask?.(nextTask)}>
          开始推荐练习
        </button>
      </aside>
    </section>
  );
}
