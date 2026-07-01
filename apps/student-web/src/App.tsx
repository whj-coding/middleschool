import { useReducer } from "react";
import { GoalSetupPage } from "./pages/GoalSetupPage";
import { InitialDiagnosticPage } from "./pages/InitialDiagnosticPage";
import { LinearFunctionTaskPage } from "./pages/LinearFunctionTaskPage";
import { MistakeReviewPage } from "./pages/MistakeReviewPage";
import { PracticePage } from "./pages/PracticePage";
import { ReportPage } from "./pages/ReportPage";
import { TodayTaskPage } from "./pages/TodayTaskPage";
import { createInitialLearningState, learningReducer } from "./state/learningFlow";
import "./styles.css";

function App() {
  const [state, dispatch] = useReducer(learningReducer, undefined, createInitialLearningState);
  const latestMistake = state.mistakes[0];

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
        {state.currentPage === "today" && <TodayTaskPage onStart={() => dispatch({ type: "startTask", taskId: "task-linear-kb" })} />}
        {state.currentPage === "task" && <LinearFunctionTaskPage onPractice={() => dispatch({ type: "enterPractice" })} />}
        {state.currentPage === "practice" && <PracticePage onSubmit={() => dispatch({ type: "submitPracticeAnswer", answer: "y = 3x + 0.4" })} />}
        {state.currentPage === "mistake" && latestMistake && (
          <MistakeReviewPage reason={latestMistake.reason} evidence={latestMistake.evidence} onReport={() => dispatch({ type: "finishReport" })} />
        )}
        {state.currentPage === "report" && <ReportPage />}
      </main>
    </div>
  );
}

export default App;
