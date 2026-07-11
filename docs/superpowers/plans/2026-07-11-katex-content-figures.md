# Controlled Formula and Figure Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render approved learning-package formulas with KaTeX and load only fixed-root, same-origin content figures with an accessible failure state.

**Architecture:** Keep the existing Markdown whitelist parser and split risky rendering into focused `MathExpression` and `ContentFigure` components. The API continues to gate approved content units; the student app adds strict formula limits, strict static-asset paths, a real project-owned figure, and browser verification.

**Tech Stack:** React 19, TypeScript 6, KaTeX, Vitest, Testing Library, Vite, Playwright, Fastify

## Global Constraints

- Support only the existing headings, paragraphs, single-level lists, bold, inline code, inline math, block math, and standalone image syntax.
- Do not accept Markdown HTML, external images, protocol-relative URLs, encoded paths, query strings, fragments, nested image directories, or SVG.
- KaTeX options are `throwOnError: true`, `trust: false`, `strict: "error"`, and a bounded `maxExpand` value.
- Reject formulas longer than 2,000 characters before calling KaTeX.
- Content figures must match `/images/content/<safe-filename>.(png|jpg|jpeg|webp)` case-insensitively.
- Use project-authored sample text and artwork; do not copy textbook prose, scanned pages, or original textbook figures into the repository.
- Do not modify OCR, question splitting, structured asset IDs, figure-recognition models, or review-state semantics in this slice.

---

### Task 1: Isolated KaTeX Rendering

**Files:**
- Create: `apps/student-web/src/components/MathExpression.tsx`
- Create: `apps/student-web/src/components/MathExpression.test.tsx`
- Modify: `apps/student-web/src/components/ControlledContentRenderer.tsx`
- Modify: `apps/student-web/src/components/ControlledContentRenderer.test.tsx`
- Modify: `apps/student-web/src/App.tsx`
- Modify: `apps/student-web/package.json`
- Modify: `apps/student-web/package-lock.json`

**Interfaces:**
- Consumes: `expression: string`, `displayMode: boolean` parsed by `ControlledContentRenderer`.
- Produces: `MathExpression({ expression, displayMode }): JSX.Element`, with `.math-inline`, `.math-block`, or `.math-fallback` output.

- [ ] **Step 1: Install KaTeX and record the exact dependency**

Run:

```powershell
cd apps/student-web
npm install katex
npm install --save-dev @types/katex
```

Expected: `package.json` and `package-lock.json` contain `katex`; installation exits 0.

- [ ] **Step 2: Write failing component tests**

Create `MathExpression.test.tsx` with:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MathExpression } from "./MathExpression";

describe("MathExpression", () => {
  it("renders trusted KaTeX output for inline and display formulas", () => {
    const { container, rerender } = render(<MathExpression expression="\\frac{1}{2}x + \\sqrt{3}" displayMode={false} />);
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(screen.getByLabelText("公式 \\frac{1}{2}x + \\sqrt{3}")).toHaveClass("math-inline");

    rerender(<MathExpression expression="y = x^2" displayMode />);
    expect(screen.getByLabelText("公式 y = x^2")).toHaveClass("math-block");
  });

  it.each(["\\notacommand{", "x".repeat(2001)])("falls back for invalid or oversized formula %s", (expression) => {
    render(<MathExpression expression={expression} displayMode={false} />);
    expect(screen.getByText(expression)).toHaveClass("math-fallback");
    expect(screen.getByText("公式暂时无法显示")).toBeInTheDocument();
  });
});
```

Update `ControlledContentRenderer.test.tsx` so the existing formula assertions also require `.katex` descendants.

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```powershell
cd apps/student-web
npx vitest run src/components/MathExpression.test.tsx src/components/ControlledContentRenderer.test.tsx
```

Expected: FAIL because `MathExpression` does not exist and formulas are still plain text.

- [ ] **Step 4: Implement the bounded math component**

Create `MathExpression.tsx` with this behavior:

```tsx
import katex from "katex";

type Props = { expression: string; displayMode: boolean };
const MAX_EXPRESSION_LENGTH = 2_000;

export function MathExpression({ expression, displayMode }: Props) {
  const className = displayMode ? "math-block" : "math-inline";
  try {
    if (expression.length > MAX_EXPRESSION_LENGTH) throw new Error("formula_too_long");
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
        <span>{expression}</span><span className="sr-only">公式暂时无法显示</span>
      </span>
    );
  }
}
```

In `ControlledContentRenderer.tsx`, import `MathExpression`, replace inline formula spans with `<MathExpression expression={token.slice(1, -1)} displayMode={false} />`, and replace block formula markup with `<MathExpression expression={block.expression} displayMode />`.

In `App.tsx`, add:

```ts
import "katex/dist/katex.min.css";
```

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```powershell
cd apps/student-web
npx vitest run src/components/MathExpression.test.tsx src/components/ControlledContentRenderer.test.tsx
```

Expected: both test files pass and invalid formulas remain readable.

- [ ] **Step 6: Commit the math slice**

```powershell
git add apps/student-web/package.json apps/student-web/package-lock.json apps/student-web/src/App.tsx apps/student-web/src/components/MathExpression.tsx apps/student-web/src/components/MathExpression.test.tsx apps/student-web/src/components/ControlledContentRenderer.tsx apps/student-web/src/components/ControlledContentRenderer.test.tsx
git commit -m "feat(student): render bounded learning formulas with KaTeX" -m "Constraint: Reject untrusted commands and formulas over 2000 characters`nConfidence: high`nScope-risk: narrow"
```

---

### Task 2: Strict Content-Figure Loading and Failure State

**Files:**
- Create: `apps/student-web/src/components/ContentFigure.tsx`
- Create: `apps/student-web/src/components/ContentFigure.test.tsx`
- Modify: `apps/student-web/src/components/ControlledContentRenderer.tsx`
- Modify: `apps/student-web/src/components/ControlledContentRenderer.test.tsx`
- Modify: `apps/student-web/src/styles.css`

**Interfaces:**
- Consumes: standalone Markdown image `alt` and `src` strings.
- Produces: `isSafeContentFigureSrc(src): boolean` and `ContentFigure({ alt, src }): JSX.Element`.

- [ ] **Step 1: Write failing path-policy and failure-state tests**

Create `ContentFigure.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentFigure, isSafeContentFigureSrc } from "./ContentFigure";

describe("isSafeContentFigureSrc", () => {
  it("accepts only fixed-root raster content figures", () => {
    expect(isSafeContentFigureSrc("/images/content/linear-kb-concept.png")).toBe(true);
    expect(isSafeContentFigureSrc("/images/content/LINEAR_1.WEBP")).toBe(true);
  });

  it.each([
    "images/content/a.png", "/other/a.png", "/images/content/nested/a.png",
    "/images/content/../a.png", "/images/content/a%2epng", "/images/content/a.png?v=1",
    "/images/content/a.png#x", "/images/content/a.svg", "//example.com/a.png", "https://example.com/a.png",
  ])("rejects %s", (src) => expect(isSafeContentFigureSrc(src)).toBe(false));
});

describe("ContentFigure", () => {
  it("replaces a failed image with an accessible placeholder", () => {
    render(<ContentFigure alt="一次函数图像" src="/images/content/linear-kb-concept.png" />);
    fireEvent.error(screen.getByRole("img", { name: "一次函数图像" }));
    expect(screen.queryByRole("img", { name: "一次函数图像" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("一次函数图像暂时无法显示");
  });
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```powershell
cd apps/student-web
npx vitest run src/components/ContentFigure.test.tsx src/components/ControlledContentRenderer.test.tsx
```

Expected: FAIL because `ContentFigure` and strict fixed-root validation do not exist.

- [ ] **Step 3: Implement the strict image component**

Create `ContentFigure.tsx`:

```tsx
import { useState } from "react";

const SAFE_CONTENT_FIGURE = /^\/images\/content\/[A-Za-z0-9_-]+\.(?:png|jpe?g|webp)$/i;
export function isSafeContentFigureSrc(src: string) { return SAFE_CONTENT_FIGURE.test(src); }

export function ContentFigure({ alt, src }: { alt: string; src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="content-figure-fallback" role="status">{alt}暂时无法显示</div>;
  return <img className="content-figure" src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
```

Move image path validation out of `ControlledContentRenderer.tsx`. `parseImage()` must call `isSafeContentFigureSrc`, and the image branch must render `<ContentFigure alt={block.alt} src={block.src} />`.

Update renderer tests to use `/images/content/linear-kb-concept.png` and retain all HTML/XSS regressions.

- [ ] **Step 4: Add stable figure and formula layout styles**

Replace the current formula and figure rules in `styles.css` with:

```css
.math-inline {
  display: inline;
  max-width: 100%;
}

.math-block {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  padding: 12px;
  background: #eff6ff;
  color: #1d4ed8;
}

.math-fallback {
  font-family: "Segoe UI", Arial, sans-serif;
  white-space: pre-wrap;
}

.content-figure,
.content-figure-fallback {
  width: 100%;
  min-height: 180px;
  max-height: 320px;
  border: 1px solid #dfe6ef;
  border-radius: 8px;
  background: #fff;
}

.content-figure {
  display: block;
  object-fit: contain;
}

.content-figure-fallback {
  display: grid;
  place-items: center;
  padding: 20px;
  color: #64748b;
  text-align: center;
}
```

Do not display technical path or KaTeX instructions in visible copy.

- [ ] **Step 5: Run focused tests, lint, and build**

Run:

```powershell
cd apps/student-web
npx vitest run src/components/ContentFigure.test.tsx src/components/ControlledContentRenderer.test.tsx
npm run lint
npm run build
```

Expected: all commands exit 0; Vite bundles KaTeX CSS and font assets.

- [ ] **Step 6: Commit the figure policy slice**

```powershell
git add apps/student-web/src/components/ContentFigure.tsx apps/student-web/src/components/ContentFigure.test.tsx apps/student-web/src/components/ControlledContentRenderer.tsx apps/student-web/src/components/ControlledContentRenderer.test.tsx apps/student-web/src/styles.css
git commit -m "feat(student): constrain learning content figures" -m "Constraint: Serve raster figures only from /images/content`nConfidence: high`nScope-risk: narrow"
```

---

### Task 3: Real Learning-Package Formula and Project-Owned Figure

**Files:**
- Create: `scripts/generate-linear-kb-figure.ps1`
- Create: `apps/student-web/public/images/content/linear-kb-concept.png`
- Modify: `services/api/src/modules/data-pipeline/routes.ts`
- Modify: `services/api/src/modules/data-pipeline/routes.test.ts`
- Modify: `apps/student-web/src/pages/LinearFunctionTaskPage.test.tsx`
- Modify: `apps/student-web/e2e/student-flow.spec.ts`

**Interfaces:**
- Consumes: the existing approved `ContentUnit.contentMarkdown` field.
- Produces: approved sample Markdown containing KaTeX syntax and `/images/content/linear-kb-concept.png`.

- [ ] **Step 1: Write failing API and page integration assertions**

In `routes.test.ts`, assert that the approved `unit-linear-kb-concept` content contains both `$y = kx + b$` and `/images/content/linear-kb-concept.png`.

In `LinearFunctionTaskPage.test.tsx`, update the mocked Markdown path and assert:

```tsx
expect(screen.getByLabelText("公式 y = kx + b").querySelector(".katex")).not.toBeNull();
expect(screen.getByRole("img", { name: "一次函数图像" })).toHaveAttribute("src", "/images/content/linear-kb-concept.png");
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```powershell
cd services/api
npx vitest run src/modules/data-pipeline/routes.test.ts
cd ../../apps/student-web
npx vitest run src/pages/LinearFunctionTaskPage.test.tsx
```

Expected: API assertion fails on the old relative path; page integration fails until its mock and renderer integration are aligned.

- [ ] **Step 3: Create a reproducible project-owned raster figure**

Create `scripts/generate-linear-kb-figure.ps1` using `System.Drawing`. The script must create the destination directory, draw a 960x540 white canvas, dark axes, a blue `y = 0.5x + 2` line, points `(0, 2)` and `(4, 4)`, and save the PNG. Use this structure with explicit coordinates so output is deterministic:

```powershell
param([string]$OutputPath = "apps/student-web/public/images/content/linear-kb-concept.png")
Add-Type -AssemblyName System.Drawing
$bitmap = [System.Drawing.Bitmap]::new(960, 540)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::White)
$axisPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(38, 52, 73), 3)
$linePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(37, 99, 235), 5)
$pointBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220, 38, 38))
$textBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(38, 52, 73))
$font = [System.Drawing.Font]::new("Arial", 20)
$originX = 180; $originY = 430; $scaleX = 110; $scaleY = 70
$graphics.DrawLine($axisPen, 80, $originY, 900, $originY)
$graphics.DrawLine($axisPen, $originX, 490, $originX, 45)
$graphics.DrawString("x", $font, $textBrush, 900, 435)
$graphics.DrawString("y", $font, $textBrush, 145, 35)
function ToPoint([double]$x, [double]$y) {
  [System.Drawing.PointF]::new($originX + $x * $scaleX, $originY - $y * $scaleY)
}
$start = ToPoint -2 1; $end = ToPoint 6 5
$graphics.DrawLine($linePen, $start, $end)
$p1 = ToPoint 0 2; $p2 = ToPoint 4 4
$graphics.FillEllipse($pointBrush, $p1.X - 7, $p1.Y - 7, 14, 14)
$graphics.FillEllipse($pointBrush, $p2.X - 7, $p2.Y - 7, 14, 14)
$graphics.DrawString("(0, 2)", $font, $textBrush, $p1.X + 12, $p1.Y - 32)
$graphics.DrawString("(4, 4)", $font, $textBrush, $p2.X + 12, $p2.Y - 32)
$graphics.DrawString("y = 0.5x + 2", $font, $textBrush, 610, 95)
$absolute = [System.IO.Path]::GetFullPath($OutputPath)
[System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($absolute)) | Out-Null
$bitmap.Save($absolute, [System.Drawing.Imaging.ImageFormat]::Png)
$font.Dispose(); $textBrush.Dispose(); $pointBrush.Dispose(); $linePen.Dispose(); $axisPen.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
```

Run from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-linear-kb-figure.ps1
```

Expected: `apps/student-web/public/images/content/linear-kb-concept.png` exists, is 960x540, and contains only project-authored geometry and labels. Open it with the local image viewer and verify both point labels and the equation are legible.

- [ ] **Step 4: Update API sample Markdown and E2E fixture**

Change the API image line to:

```md
![一次函数图像](/images/content/linear-kb-concept.png)
```

Keep the formula sample as valid TeX. Update the E2E learning-package mock to include a heading, `$y = kx + b$`, and the same image line. Add browser assertions for `.katex` visibility and a loaded image with `naturalWidth > 0`.

- [ ] **Step 5: Run integration tests and verify GREEN**

Run:

```powershell
cd services/api
npx vitest run src/modules/data-pipeline/routes.test.ts
npm run build
cd ../../apps/student-web
npx vitest run src/pages/LinearFunctionTaskPage.test.tsx
npm run build
```

Expected: all commands pass and the static asset is copied into `dist/images/content/`.

- [ ] **Step 6: Commit the real-content slice**

```powershell
git add scripts/generate-linear-kb-figure.ps1 services/api/src/modules/data-pipeline/routes.ts services/api/src/modules/data-pipeline/routes.test.ts apps/student-web/public/images/content/linear-kb-concept.png apps/student-web/src/pages/LinearFunctionTaskPage.test.tsx apps/student-web/e2e/student-flow.spec.ts
git commit -m "feat(content): publish a rendered linear-function sample" -m "Constraint: Use project-owned artwork only`nConfidence: high`nScope-risk: narrow"
```

---

### Task 4: Browser Verification, Review, and State Update

**Files:**
- Modify: `STATE.md`
- Test: `apps/student-web/e2e/student-flow.spec.ts`

**Interfaces:**
- Consumes: the completed formula renderer, strict figure component, API sample, and static PNG.
- Produces: verification evidence and an updated project-state record.

- [ ] **Step 1: Run complete automated verification**

Run in parallel where possible:

```powershell
cd apps/student-web
npm test
npm run lint
npm run build
npm run test:e2e
```

```powershell
cd services/api
npm test
npm run build
```

Expected: every command exits 0; Playwright reports the student flow passing with no captured console errors.

- [ ] **Step 2: Start the local API and student app**

Run API on `127.0.0.1:4000` and student Vite on the first available port starting at `5173`. Preserve both process IDs so they can be stopped after verification.

- [ ] **Step 3: Verify real browser rendering at desktop and mobile widths**

Using Playwright or the in-app browser, complete the login/diagnostic/task path at `1440x900` and `390x844`. Confirm:

- KaTeX markup is visible for inline and block formulas.
- `/images/content/linear-kb-concept.png` returns HTTP 200 and `naturalWidth > 0`.
- A long block formula scrolls within its own container without widening the page.
- The figure stays inside the learning material region.
- Formula, image, task controls, and adjacent text do not overlap.

Capture screenshots for review outside tracked source unless the project explicitly records QA screenshots.

- [ ] **Step 4: Trigger and verify the image failure state**

Intercept the content PNG request with HTTP 404. Confirm the image is replaced by the `role="status"` placeholder and no broken-image icon or layout overlap remains.

- [ ] **Step 5: Request independent code review**

Dispatch a fresh reviewer who did not author the implementation. Ask for findings ordered by severity, specifically covering KaTeX trust boundaries, `dangerouslySetInnerHTML`, path policy bypasses, failure-state accessibility, real asset loading, and missing tests. Fix all actionable findings and rerun affected tests.

- [ ] **Step 6: Update project state**

Add a concise `STATE.md` entry recording that controlled learning content now has real KaTeX rendering, fixed-root project-owned figures, and image failure fallback. Record structured asset IDs and independent asset review as the next slice.

- [ ] **Step 7: Commit state and verification record**

```powershell
git add STATE.md
git commit -m "docs(state): record formula and figure rendering slice" -m "Confidence: high`nScope-risk: narrow"
```

- [ ] **Step 8: Final clean-tree check**

Run:

```powershell
git status --short --branch
git diff --check HEAD~4..HEAD
git log -5 --oneline --decorate
```

Expected: clean working tree, no whitespace errors, and four focused implementation commits after the design and plan commits.
