import { useState } from "react";

export function ContentFigure({ alt, src }: { alt: string; src: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="content-figure-fallback" role="status">
        {alt}暂时无法显示
      </div>
    );
  }

  return <img className="content-figure" src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
