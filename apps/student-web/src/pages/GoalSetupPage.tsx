import type { GoalScore } from "../state/learningFlow";

type Props = {
  onSelectGoal: (goalScore: GoalScore) => void;
};

export function GoalSetupPage({ onSelectGoal }: Props) {
  return (
    <section className="panel">
      <p className="eyebrow">学习档案</p>
      <h1>先定一个中考数学目标</h1>
      <p>目标分数会影响诊断后的任务推荐强度。MVP 先聚焦一次函数闭环。</p>
      <div className="button-row">
        <button onClick={() => onSelectGoal("80")}>80 分稳基础</button>
        <button onClick={() => onSelectGoal("100")}>100 分补短板</button>
        <button className="primary" onClick={() => onSelectGoal("110+")}>
          选择 110+ 并开始诊断
        </button>
        <button onClick={() => onSelectGoal("full-score")}>满分冲刺</button>
      </div>
    </section>
  );
}
