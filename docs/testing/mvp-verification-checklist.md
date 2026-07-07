# MVP Verification Checklist

## Student Flow

- [ ] Student can log in.
- [ ] Student can set target score to 80, 100, 110+, or full-score sprint.
- [ ] Student can complete initial diagnostic.
- [ ] Student can enter the linear-function module.
- [ ] Student can complete module diagnostic.
- [ ] Student receives a recommended task with a clear reason.
- [ ] Student can choose 10, 20, or 40 minute duration.
- [ ] Student can interact with k and b graph controls.
- [ ] Student can submit a practice answer.
- [ ] 练习提交页展示可记录的交互日志意图：`submit_answer`、题目 ID、提示层级。
- [ ] Student receives hint mode before answer mode.
- [ ] Student receives mistake reason after a wrong answer.
- [ ] Student receives a next task after report generation.
- [ ] Mistake enters retry list.

## AI Behavior

- [ ] Hint mode does not reveal final answer before submission.
- [ ] Explanation mode identifies student thought, mistake reason, and next step.
- [ ] Answer mode opens only after submission or repeated help.
- [ ] AI marks uncertainty instead of inventing graph conditions.

## Voice

- [ ] Student voice input is transcribed to visible text.
- [ ] Student can confirm or edit transcript before AI uses it.
- [ ] AI spoken explanation also appears as text.

## Question Bank

- [ ] Markdown question imports as pending_review.
- [ ] Reviewer can edit question, answer, explanation, tags, and figure recognition result.
- [ ] Unreviewed question cannot publish.
- [ ] Unusable question stays hidden from student APIs.

## Figure Recognition

- [ ] Figure result includes type, key elements, confidence, and review status.
- [ ] Low-confidence figure result is blocked from student explanation.
- [ ] Approved figure result can be used in reviewed explanation.

## Admin Review

- [ ] Admin can see import job status.
- [ ] Admin can approve a question.
- [ ] Admin can approve or correct figure recognition.
- [ ] Only approved content can be published.

## Reports

- [ ] Report shows completion, progress point, weak points, mistake reason, and next task.
- [ ] Report avoids exposing excessive backend analytics to student.

## Mobile And Visual QA

- [ ] Student task page has no horizontal overflow at 390 px width.
- [ ] Graph, formula, practice answer, and AI coach text do not overlap.
- [ ] Primary actions remain reachable without hiding voice controls.

## 数据管线补充检查

- [ ] 未审核内容单元不会出现在学生端学习包。
- [ ] 学生提交答案和请求提示会生成交互日志。
- [ ] 内容单元审核状态变化后，后台和学习包编排结果一致。
