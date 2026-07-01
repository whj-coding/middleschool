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
  );
}

export default App;
