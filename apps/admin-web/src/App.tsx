import { useState } from "react";
import { FigureReviewPage } from "./pages/FigureReviewPage";
import { ImportJobsPage } from "./pages/ImportJobsPage";
import { PublishControlPage } from "./pages/PublishControlPage";
import { QuestionReviewPage } from "./pages/QuestionReviewPage";

type AdminStep = "imports" | "question" | "figure" | "publish";

function App() {
  const [step, setStep] = useState<AdminStep>("imports");

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">内容审核后台</p>
          <h1>一次函数题库发布控制</h1>
        </div>
        <ol aria-label="审核进度" className="stepper">
          <li className={step === "imports" ? "active" : ""}>导入</li>
          <li className={step === "question" ? "active" : ""}>题目</li>
          <li className={step === "figure" ? "active" : ""}>图形</li>
          <li className={step === "publish" ? "active" : ""}>发布</li>
        </ol>
      </header>

      {step === "imports" && <ImportJobsPage onNext={() => setStep("question")} />}
      {step === "question" && <QuestionReviewPage onNext={() => setStep("figure")} />}
      {step === "figure" && <FigureReviewPage onNext={() => setStep("publish")} />}
      {step === "publish" && <PublishControlPage />}
    </main>
  );
}

export default App;
