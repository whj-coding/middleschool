import { todayTask } from "../data/mockLearning";

type Props = {
  onStart: () => void;
};

export function TodayTaskPage({ onStart }: Props) {
  return (
    <section className="panel">
      <p className="eyebrow">今日任务</p>
      <h1>{todayTask.title}</h1>
      <p>{todayTask.reason}</p>
      <div className="duration-row">
        {todayTask.durationOptions.map((duration) => (
          <span key={duration}>{duration} 分钟</span>
        ))}
      </div>
      <p className="completion">{todayTask.completion}</p>
      <button className="primary" onClick={onStart}>
        开始今日任务
      </button>
    </section>
  );
}
