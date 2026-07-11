import katex from "katex";

type Props = {
  expression: string;
  displayMode: boolean;
};

const MAX_EXPRESSION_LENGTH = 2_000;
const UNTRUSTED_COMMAND = /\\(?:href|url|includegraphics|htmlClass|htmlId|htmlStyle|htmlData)\b/;

export function MathExpression({ expression, displayMode }: Props) {
  const className = displayMode ? "math-block" : "math-inline";

  try {
    if (expression.length > MAX_EXPRESSION_LENGTH) {
      throw new Error("formula_too_long");
    }
    if (UNTRUSTED_COMMAND.test(expression)) {
      throw new Error("formula_contains_untrusted_command");
    }

    const html = katex.renderToString(expression, {
      displayMode,
      throwOnError: true,
      trust: false,
      strict: "error",
      maxExpand: 1_000,
      output: "htmlAndMathml",
    });

    return <span className={className} aria-label={`公式 ${expression}`} dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return (
      <span className={`${className} math-fallback`} aria-label={`公式 ${expression}`}>
        <span>{expression}</span>
        <span className="sr-only">公式暂时无法显示</span>
      </span>
    );
  }
}
