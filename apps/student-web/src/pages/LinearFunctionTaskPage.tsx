import { useEffect, useState } from "react";
import { ControlledContentRenderer } from "../components/ControlledContentRenderer";
import { LinearFunctionGraph } from "../components/LinearFunctionGraph";
import { todayTask } from "../data/mockLearning";
import { fetchLearningPackage, type LearningPackageUnit } from "../services/learningPackageApi";
import type { TodayTask } from "../services/todayTaskApi";

type Props = {
  onPractice: () => void;
  task?: TodayTask | null;
};

export function LinearFunctionTaskPage({ onPractice, task = todayTask }: Props) {
  const [packageUnits, setPackageUnits] = useState<LearningPackageUnit[]>([]);
  const activeTask = task ?? todayTask;

  useEffect(() => {
    let active = true;

    fetchLearningPackage(activeTask.learningPackageQuery)
      .then((learningPackage) => {
        if (active) setPackageUnits(learningPackage.units);
      })
      .catch(() => {
        if (active) setPackageUnits([]);
      });

    return () => {
      active = false;
    };
  }, [activeTask.learningPackageQuery]);

  return (
    <section className="study-split">
      <div className="problem-panel">
        <div className="breadcrumb">今日任务 / 3/5</div>
        <div className="problem-toolbar">
          <button>上一题</button>
          <button>下一题</button>
        </div>
        <span className="level-tag">当前题目 · 中等</span>
        <h1>{activeTask.title}</h1>
        <p className="problem-copy">
          已知一次函数 y = kx + b 的图像经过点 (2, 3)，且与 y 轴交点在 (0, -1)。先观察图像，再试着解释 k 和 b 的意义。
        </p>
        <div className="answer-box">
          <strong>我的思路</strong>
          <p>先找 b：当 x = 0 时，y = -1，所以 b = -1。再代入点 (2, 3)，得到 k = 2。</p>
          <div className="answer-actions">
            <button>清空</button>
            <button className="primary">提交答案</button>
          </div>
        </div>
        <div className="scratchpad">
          <strong>草稿纸</strong>
          <p>3 = 2k - 1，所以 2k = 4，k = 2。</p>
        </div>
        {packageUnits.length > 0 && (
          <div className="learning-package">
            <strong>已审核学习材料</strong>
            {packageUnits.map((unit) => (
              <article key={unit.id}>
                <span>
                  {unit.chunkType} · {unit.difficulty} · {unit.ability}
                </span>
                <ControlledContentRenderer markdown={unit.contentMarkdown} />
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="visual-workspace">
        <div className="mode-tabs" aria-label="AI 帮助模式">
          <button className="active">提示模式</button>
          <button>讲解模式</button>
          <button disabled>答案模式 · 提交后可解锁</button>
        </div>
        <LinearFunctionGraph />
        <div className="condition-grid">
          <div>
            <strong>已知条件</strong>
            <ul>
              <li>直线 y = kx + b 经过点 (2, 3)</li>
              <li>与 y 轴的交点在 (0, -1)</li>
            </ul>
          </div>
          <div>
            <strong>求解目标</strong>
            <ul>
              <li>说清楚 b 为什么等于 -1</li>
              <li>解释 k 表示单位变化量</li>
            </ul>
          </div>
        </div>
        <div className="voice-strip">
          <div>
            <strong>语音输入</strong>
            <span>识别结果：第二问我卡在交点 B 坐标不会求</span>
          </div>
          <button>重新录入</button>
        </div>
        <button className="primary" onClick={onPractice}>
          进入练习
        </button>
      </div>

      <aside className="coach-panel">
        <div className="coach-heading">
          <span className="coach-avatar">AI</span>
          <div>
            <h2>AI 教练</h2>
            <span>在线 · 当前题上下文已记住</span>
          </div>
        </div>
        <div className="chat-card">
          <p>你好，张同学。我会陪你把这道题弄明白。你想先从哪里开始？</p>
        </div>
        <div className="chat-card reply">
          <p>第二问我卡在交点 B 坐标不会求。</p>
        </div>
        <div className="chat-card">
          <p>没问题。交点 B 同时在两条直线上，所以它的坐标要同时满足两个表达式。你能先把两个式子联立起来吗？</p>
          <div className="coach-actions">
            <button>复制</button>
            <button>播放</button>
          </div>
        </div>
        <div className="hint-row">
          <button>提示1：如何联立？</button>
          <button>提示2：代入消元</button>
          <button>我再想想</button>
        </div>
        <div className="diagnosis-panel">
          <strong>错因诊断</strong>
          <div className="donut">62%</div>
          <p>同类题常见错因：联立方程求交点出错。</p>
          <ul className="diagnosis-list">
            <li>
              <span>联立方程求交点出错</span>
              <strong>62%</strong>
            </li>
            <li>
              <span>忽略 y 轴交点坐标</span>
              <strong>23%</strong>
            </li>
            <li>
              <span>x 轴交点求解错误</span>
              <strong>10%</strong>
            </li>
          </ul>
        </div>
        <div className="knowledge-review">
          <strong>本题关键知识点回顾</strong>
          <div className="knowledge-cards">
            <span>一次函数图像与性质 · 掌握度 85%</span>
            <span>两直线交点 · 掌握度 72%</span>
          </div>
          <button>查看知识点讲解</button>
        </div>
        <div className="voice-controls">
          <button>播放</button>
          <button className="mic-button">按住说话</button>
          <button>键盘</button>
        </div>
        <div className="progress-footer">
          <span>任务进度 3 / 5</span>
          <i />
        </div>
      </aside>
    </section>
  );
}
