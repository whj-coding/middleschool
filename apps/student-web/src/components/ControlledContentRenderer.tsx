import type { ReactNode } from "react";

type Props = {
  markdown: string;
};

type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "math"; expression: string }
  | { type: "image"; alt: string; src: string };

function isSafeImageSrc(src: string) {
  return (src.startsWith("/") && !src.startsWith("//")) || src.startsWith("./") || src.startsWith("images/");
}

function parseImage(line: string) {
  const match = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
  if (!match) return null;
  const [, alt, src] = match;
  if (!isSafeImageSrc(src)) return null;
  return { alt, src };
}

function parseBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let mathLines: string[] = [];
  let inMathBlock = false;

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  }

  function flushList() {
    if (listItems.length === 0) return;
    blocks.push({ type: "list", items: listItems });
    listItems = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (inMathBlock) {
      if (line === "$$") {
        blocks.push({ type: "math", expression: mathLines.join("\n") });
        mathLines = [];
        inMathBlock = false;
      } else {
        mathLines.push(rawLine);
      }
      continue;
    }

    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }

    if (line === "$$") {
      flushParagraph();
      flushList();
      inMathBlock = true;
      continue;
    }

    const inlineMath = line.match(/^\$\$(.+)\$\$$/);
    if (inlineMath) {
      flushParagraph();
      flushList();
      blocks.push({ type: "math", expression: inlineMath[1].trim() });
      continue;
    }

    const image = parseImage(line);
    if (image) {
      flushParagraph();
      flushList();
      blocks.push({ type: "image", ...image });
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: heading[1].length as 2 | 3, text: heading[2] });
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      listItems.push(listItem[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  if (inMathBlock && mathLines.length > 0) {
    blocks.push({ type: "math", expression: mathLines.join("\n") });
  }

  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern = /(`[^`]+`|\*\*[^*]+\*\*|\$[^$\n]+\$)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text))) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];
    const key = `${match.index}-${token}`;

    if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(
        <span className="math-inline" key={key} aria-label={`公式 ${token.slice(1, -1)}`}>
          {token.slice(1, -1)}
        </span>,
      );
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function ControlledContentRenderer({ markdown }: Props) {
  const blocks = parseBlocks(markdown);

  return (
    <div className="controlled-content">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = block.level === 2 ? "h2" : "h3";
          return <HeadingTag key={index}>{renderInline(block.text)}</HeadingTag>;
        }

        if (block.type === "list") {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "math") {
          return (
            <div className="math-block" key={index} aria-label={`公式 ${block.expression}`}>
              {block.expression}
            </div>
          );
        }

        if (block.type === "image") {
          return <img className="content-figure" key={index} src={block.src} alt={block.alt} loading="lazy" />;
        }

        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
