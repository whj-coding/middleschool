import { useReducer } from "react";
import "katex/dist/katex.min.css";
import { todayTask } from "./data/mockLearning";
import { GoalSetupPage } from "./pages/GoalSetupPage";
import { InitialDiagnosticPage } from "./pages/InitialDiagnosticPage";
import { LinearFunctionTaskPage } from "./pages/LinearFunctionTaskPage";
import { MistakeReviewPage } from "./pages/MistakeReviewPage";
import { PracticePage } from "./pages/PracticePage";
import { ReportPage } from "./pages/ReportPage";
import { TodayTaskPage } from "./pages/TodayTaskPage";
import { startTask } from "./services/taskStartApi";
import { createInitialLearningState, learningReducer } from "./state/learningFlow";
import type { TodayTask } from "./services/todayTaskApi";
import "./styles.css";

function createRecommendedTask(task: { id: string; title: string }): TodayTask {
  return {
    ...todayTask,
    id: task.id,
    title: task.title,
    reason: "根据本次错因分析，先用相似生活场景巩固固定费用和变化费用。",
    taskContent: "完成 1 个生活建模讲解、2 道相似题和 1 次错因对照。",
    estimatedMinutes: 20,
    completion: "完成 1 个生活建模讲解、2 道相似题和 1 次错因对照。",
    completionStandard: "能独立分清固定费用和单位变化费用，并写出对应一次函数表达式。",
    learningPackageQuery: {
      knowledgeTag: "打印费建模",
      difficulty: "基础",
      ability: "应用",
    },
  };
}

function App() {
  const [state, dispatch] = useReducer(learningReducer, undefined, createInitialLearningState);
  const latestMistake = state.mistakes[0];

  async function handleStartNextTask(task: { id: string; title: string }) {
    const recommendedTask = createRecommendedTask(task);
    try {
      await startTask(recommendedTask.id);
    } catch {
      // Prototype can continue when the API is unavailable.
    }
    dispatch({ type: "startTask", task: recommendedTask });
  }

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">f</span>
          <div>
            <strong>AI 数学学习教练</strong>
            <span>初三 · 中考专题</span>
          </div>
        </div>
        <nav aria-label="学习工具">
          <strong className="course-title">一次函数：y = kx + b</strong>
          <a>学习记录</a>
          <a>错题本</a>
          <a>我的收藏</a>
        </nav>
        <div className="student-chip">
          <span className="avatar" />
          <div>
            <strong>张同学</strong>
            <span>初三（2）班</span>
          </div>
        </div>
      </header>
      <main className="app-shell">
        {state.currentPage === "goal" && <GoalSetupPage onSelectGoal={(goalScore) => dispatch({ type: "setGoal", goalScore })} />}
        {state.currentPage === "diagnostic" && <InitialDiagnosticPage onNext={() => dispatch({ type: "finishInitialDiagnostic" })} />}
        {state.currentPage === "today" && <TodayTaskPage onStart={(task) => dispatch({ type: "startTask", task })} />}
        {state.currentPage === "task" && (
          <LinearFunctionTaskPage task={state.activeTask} onPractice={() => dispatch({ type: "enterPractice" })} />
        )}
        {state.currentPage === "practice" && (
          <PracticePage
            taskId={state.practiceTaskId ?? state.activeTaskId ?? todayTask.id}
            questionId={state.retryQuestionId ?? undefined}
            onSubmit={() => dispatch({ type: "submitPracticeAnswer", answer: "y = 3x + 0.4" })}
          />
        )}
        {state.currentPage === "mistake" && latestMistake && (
          <MistakeReviewPage reason={latestMistake.reason} evidence={latestMistake.evidence} onReport={() => dispatch({ type: "finishReport" })} />
        )}
        {state.currentPage === "report" && (
          <ReportPage
            onRetryPractice={(questionId, taskId) => dispatch({ type: "startRetryPractice", questionId, taskId })}
            onStartNextTask={(task) => void handleStartNextTask(task)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
