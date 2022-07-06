interface Sheet {
  replaceSync: Fn;
  cssRules: Record<string, any>[];
}

/**
 * @name parseColor
 * @description Parses a color string into an array of RGB(A) values.
 * @param {string} color - A CSS parsable color string or a CSS variable name in :root.
 * @return {[number, number, number, number?]} An array of the RGB(A) values.
 */
function parseColor(color) {
  if (color.indexOf('--') === 0) {
    color = getComputedStyle(document.documentElement).getPropertyValue(color);
  }

  const sheet = (new CSSStyleSheet()) as any as Sheet;
  sheet.replaceSync(`target {color: ${color}}`);
  return sheet.cssRules[0].style.color.match(/[\.\d]+/g).map(Number);
};

export = parseColor;