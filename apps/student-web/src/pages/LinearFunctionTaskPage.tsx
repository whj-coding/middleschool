import { LinearFunctionGraph } from "../components/LinearFunctionGraph";
import { todayTask } from "../data/mockLearning";

type Props = {
  onPractice: () => void;
};

export function LinearFunctionTaskPage({ onPractice }: Props) {
  return (
    <section className="workspace">
      <div className="panel">
        <p className="eyebrow">一次函数任务</p>
        <h1>{todayTask.title}</h1>
        <p>把打车费、打印费、手机套餐这类生活问题拆成固定费用和变化费用，就能更稳地理解 y = kx + b。</p>
        <LinearFunctionGraph />
      </div>
      <aside className="coach">
        <h2>AI 学习教练</h2>
        <p>先观察图像：k 决定每增加 1 个 x，y 改变多少；b 决定 x = 0 时从哪里开始。</p>
        <button className="primary" onClick={onPractice}>
          进入练习
        </button>
      </aside>
    </section>
  );
}
