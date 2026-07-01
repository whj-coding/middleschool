type Props = {
  onSubmit: () => void;
};

export function PracticePage({ onSubmit }: Props) {
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
            <input aria-label="最终答案" defaultValue="y = 3x + 0.4" />
          </label>
          <label>
            <span>我的步骤</span>
            <textarea aria-label="我的步骤" defaultValue="我把每页费用写成了固定部分，可能没有分清 x 表示页数。" />
          </label>
        </div>

        <div className="voice-strip">
          <div>
            <strong>语音说思路</strong>
            <span>转写：我觉得 3 元是固定费用，0.4 元才是每增加 1 页变化的费用。</span>
          </div>
          <button>重新录入</button>
        </div>

        <div className="answer-actions full">
          <button>保存思路</button>
          <button className="primary" onClick={onSubmit}>
            提交答案
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
