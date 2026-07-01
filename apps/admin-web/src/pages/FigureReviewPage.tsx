import { reviewQueue } from "../data/mockReviewQueue";

export function FigureReviewPage({ onNext }: { onNext: () => void }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">图形识别审核</p>
          <h2>{reviewQueue.figure.figureType}</h2>
        </div>
        <span className="status">置信度 {Math.round(reviewQueue.figure.confidence * 100)}%</span>
      </div>
      <ul className="element-list">
        {reviewQueue.figure.elements.map((element) => <li key={element}>{element}</li>)}
      </ul>
      <p className="note">识别结果必须审核通过后才能用于学生讲解。</p>
      <button type="button" onClick={onNext}>图形识别通过</button>
    </section>
  );
}
