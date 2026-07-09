# 练习页语音说思路闭环设计

## 背景

MVP 已有一次函数练习页、交互日志、任务状态联动、复练候选和学情报告。当前语音能力在学生端仍是静态文案，尚未形成“学生说出思路 -> 系统转写 -> 保留为当前题证据 -> 提交时进入交互日志”的闭环。

本设计只补练习页的语音说思路小切片，继续保持数学 MVP 和一次函数闭环优先，不引入真实麦克风、真实 STT/TTS、真实 AI 编排、OCR 或复杂图形识别。

## 目标

在 `PracticePage` 中跑通一个可验证的 mock 语音思路流程：

1. 学生点击“重新录入”。
2. 学生端调用现有后端 mock STT 接口。
3. 页面展示可编辑的转写内容。
4. 学生提交答案时，提交 payload 包含当前 `taskId`、`questionId`、最终答案、步骤文本和语音转写内容。
5. API 不可用时，页面保留静态降级体验，不阻断练习提交。

## 非目标

- 不申请浏览器麦克风权限。
- 不录制真实音频流。
- 不接真实 STT/TTS 服务。
- 不改 AI 教练多轮状态机。
- 不扩展到物理、化学或其他数学模块。
- 不重构已有学习流、报告流和错题复练队列。

## 推荐方案

采用最小前端闭环：

- 新增 `apps/student-web/src/services/voiceApi.ts`，封装 `transcribeVoiceThought()`。
- `PracticePage` 维护语音转写状态，点击“重新录入”调用 mock STT。
- 转写结果放入可编辑文本框，学生可修改。
- 提交答案时，将语音转写内容追加进 `recordInteraction()` 的 `studentAnswer` 证据文本中，避免本切片修改后端 `InteractionLog` 类型。
- Playwright 中 mock `/api/voice/stt` 与 `/api/student/interactions`，验证转写展示和提交 payload。

这个方案复用现有交互日志接口，避免新增数据库字段，同时给后续错因诊断 Agent 留出可解析的学生思路证据。

## 页面行为

### 初始状态

练习页仍展示默认答案、步骤和语音说思路区域。语音区域显示已有静态示例转写。

### 重新录入

点击“重新录入”后：

- 按钮进入 `转写中...` 状态。
- 调用 `POST /api/voice/stt`，payload 使用 mock 音频占位 `audioBase64`。
- 成功后展示接口返回的 `transcript`。
- 失败时保留原文案，并显示“语音转写暂不可用，可继续手动输入思路。”。

### 编辑转写

转写内容展示为 textarea，label 为“语音转写”。学生可以直接编辑，提交时以编辑后的内容为准。

### 提交答案

提交时 `recordInteraction()` 仍使用 `action: "submit_answer"`，但 `studentAnswer` 改为包含三段证据：

```text
最终答案：...
我的步骤：...
语音转写：...
```

这样报告、错因和后续 AI 教练可以在不改后端 schema 的前提下读取学生思路证据。

## 接口约定

### `transcribeVoiceThought(fetcher?)`

- 文件：`apps/student-web/src/services/voiceApi.ts`
- 请求：`POST /api/voice/stt`
- 请求体：

```ts
{
  audioBase64: string;
}
```

- 返回：

```ts
{
  transcript: string;
  confidence: number;
}
```

- 失败：抛出 `Error("Failed to transcribe voice thought")`。

## 测试策略

### 单元测试

- `voiceApi.test.ts`
  - 验证请求路径、方法、JSON body。
  - 验证成功返回 transcript。
  - 验证非 OK 响应抛错。

- `PracticePage.test.tsx`
  - 点击“重新录入”后显示 mock 转写。
  - 编辑“语音转写”后提交，`recordInteraction` payload 的 `studentAnswer` 包含编辑后的转写。

### E2E

- `student-flow.spec.ts`
  - mock `/api/voice/stt`。
  - mock `/api/student/interactions` 并捕获提交 payload。
  - 验证练习页语音转写出现。
  - 验证提交 payload 包含 `taskId`、`questionId` 和语音转写内容。

## 验收标准

- 点击“重新录入”能显示 mock STT 转写结果。
- 转写内容可编辑。
- 提交答案时交互日志 payload 带入当前题的语音思路证据。
- API 不可用时练习页仍可提交答案并继续学习流。
- `apps/student-web npm test`、`npm run lint`、`npm run build`、`npm run test:e2e` 通过。
- `services/api npm test`、`npm run build` 通过。

## 自审记录

- 占位扫描：未发现未完成标记或未定义接口。
- 范围检查：只覆盖练习页语音说思路，不接真实音频或真实 AI。
- 类型一致性：复用现有 `recordInteraction.studentAnswer`，避免后端 schema 变更。
