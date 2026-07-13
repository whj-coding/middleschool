const SAFE_CONTENT_FIGURE = /^\/images\/content\/[A-Za-z0-9_-]+\.(?:png|jpe?g|webp)$/i;

export function isSafeContentFigureSrc(src: string) {
  return SAFE_CONTENT_FIGURE.test(src);
}
