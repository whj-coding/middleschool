import { useEffect, useState } from "react";
import { todayTask } from "../data/mockLearning";
import { startTask } from "../services/taskStartApi";
import { fetchTodayTask, type TodayTask } from "../services/todayTaskApi";

type Props = {
  onStart: (task: TodayTask) => void;
};

export function TodayTaskPage({ onStart }: Props) {
  const [task, setTask] = useState<TodayTask>(todayTask);

  async function handleStart() {
    try {
      await startTask(task.id);
    } catch {
      // Prototype can continue when the API is unavailable.
    }
    onStart(task);
  }

  useEffect(() => {
    let active = true;

    fetchTodayTask("student-demo")
      .then((apiTask) => {
        if (active) setTask(apiTask);
      })
      .catch(() => {
        if (active) setTask(todayTask);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="panel">
      <p className="eyebrow">今日任务</p>
      <h1>{task.title}</h1>
      <p>{task.reason}</p>
      <div className="task-brief">
        <span>任务内容：{task.taskContent}</span>
        <span>预计时间：{task.estimatedMinutes} 分钟</span>
        <span>完成标准：{task.completionStandard}</span>
      </div>
      <div className="duration-row">
        {task.durationOptions.map((duration) => (
          <span key={duration}>{duration} 分钟</span>
        ))}
      </div>
      <p className="completion">{task.completion}</p>
      <button className="primary" onClick={() => void handleStart()}>
        开始今日任务
      </button>
    </section>
  );
}
