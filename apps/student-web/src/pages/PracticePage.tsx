import { useState } from "react";
import { recordInteraction } from "../services/interactionApi";
import { submitPracticeAnswer, type PracticeSubmissionResult } from "../services/practiceApi";
import { transcribeVoiceThought } from "../services/voiceApi";

type Props = {
  onSubmit: (result: PracticeSubmissionResult) => void;
  taskId: string;
  questionId?: string;
};

const DEFAULT_ANSWER = "y = 3x + 0.4";
const DEFAULT_STEPS = "我把每页费用写成了固定部分，可能没有分清 x 表示页数。";
const VOICE_TRANSCRIPT_EXAMPLE = "例如：我觉得 3 元是固定费用，0.4 元才是每增加 1 页变化的费用。";

function buildStudentAnswerEvidence(answer: string, steps: string, voiceTranscript: string) {
  const evidence = [`最终答案：${answer}`, `我的步骤：${steps}`];
  if (voiceTranscript.trim()) evidence.push(`语音转写：${voiceTranscript.trim()}`);
  return evidence.join("\n");
}

export function PracticePage({ onSubmit, taskId, questionId = "practice-printing-fee" }: Props) {
  const [answer, setAnswer] = useState(DEFAULT_ANSWER);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "transcribing" | "failed">("idle");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "failed">("idle");

  async function handleVoiceRetry() {
    setVoiceStatus("transcribing");
    try {
      const result = await transcribeVoiceThought();
      setVoiceTranscript(result.transcript);
      setVoiceStatus("idle");
    } catch {
      setVoiceStatus("failed");
    }
  }

  async function handleSubmit() {
    const studentAnswer = buildStudentAnswerEvidence(answer, steps, voiceTranscript);
    setSubmitStatus("submitting");
    try {
      const result = await submitPracticeAnswer({
        sessionId: "practice-1",
        studentId: "student-demo",
        taskId,
        questionId,
        answer,
      });
      try {
        await recordInteraction({
          studentId: "student-demo",
          taskId,
          questionId,
          action: "submit_answer",
          studentAnswer,
          hintLevel: 1,
          correct: result.correct,
        });
      } catch {
        // Grading succeeded, so interaction logging must not block the learning flow.
      }
      setSubmitStatus("idle");
      onSubmit(result);
    } catch {
      setSubmitStatus("failed");
    }
  }

  return (
    <section className="flow-stage practice-stage">
      <div className="stage-main">
        <p className="eyebrow">即时练习 · 建模题</p>
        <h1>打印费建模</h1>
        <p className="stage-copy">某打印店收取 3 元基础服务费，每打印 1 页加 0.4 元。请写出总费用 y 与页数 x 的关系式。</p>

        <div className="question-meta">
          <span>难度：基础</span>
          <span>能力：应用建模</span>
          <span>错因关注：固定费用和变化费用</span>
        </div>

        <div className="answer-workspace">
          <label>
            <span>最终答案</span>
            <input aria-label="最终答案" value={answer} onChange={(event) => setAnswer(event.target.value)} />
          </label>
          <label>
            <span>我的步骤</span>
            <textarea aria-label="我的步骤" value={steps} onChange={(event) => setSteps(event.target.value)} />
          </label>
        </div>

        <div className="voice-strip">
          <label>
            <strong>语音说思路</strong>
            <span>语音转写</span>
            <textarea
              aria-label="语音转写"
              value={voiceTranscript}
              placeholder={VOICE_TRANSCRIPT_EXAMPLE}
              onChange={(event) => setVoiceTranscript(event.target.value)}
            />
          </label>
          <button onClick={() => void handleVoiceRetry()} disabled={voiceStatus === "transcribing"}>
            {voiceStatus === "transcribing" ? "转写中..." : "重新录入"}
          </button>
        </div>
        {voiceStatus === "failed" && <p className="sync-status">语音转写暂不可用，可继续手动输入思路。</p>}
        {submitStatus === "failed" && <p className="sync-status">提交失败，请重试。你的答案已保留。</p>}

        <div className="sync-status">
          <span>将记录：submit_answer</span> · questionId={questionId} · hintLevel=1
        </div>

        <div className="answer-actions full">
          <button>保存思路</button>
          <button className="primary" onClick={() => void handleSubmit()} disabled={submitStatus === "submitting"}>
            {submitStatus === "submitting" ? "提交中..." : "提交答案"}
          </button>
        </div>
      </div>

      <aside className="stage-coach">
        <h2>AI 提示模式</h2>
        <div className="chat-card">
          <p>先不直接给答案。你先找两个信息：固定不变的费用是多少？每增加 1 页，费用增加多少？</p>
        </div>
        <div className="coach-checklist">
          <strong>作答前检查</strong>
          <span>变量 x 是否表示页数</span>
          <span>b 是否是固定服务费</span>
          <span>k 是否是每页增加费用</span>
        </div>
        <div className="mode-tabs compact">
          <button className="active">提示</button>
          <button>讲解</button>
          <button disabled>答案</button>
        </div>
      </aside>
    </section>
  );
}
