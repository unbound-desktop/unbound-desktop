/**
 * @name appendCSS
 * @description Appends CSS to the DOM's head
 * @param {string} id - The unique identifier for this CSS application
 * @param {string} css - The CSS string to apply to the DOM
 * @return {function} Returns the function that removes the instance of this DOM element
 */

module.exports = (id, css) => {
   const stylesheet = document.createElement('style');
   stylesheet.id = id ?? 'Unknown';
   stylesheet.innerHTML = css;
   const res = document.head.appendChild(stylesheet);

   return () => res.remove();
};