export function downloadAsTextFile(fileName: string, content: string) {
  const blob: Blob = new Blob([content], { type: 'file/txt' });
  const blobUrl: string = window.URL.createObjectURL(blob);
  const hiddenElement: HTMLAnchorElement = createElement(blobUrl, fileName);
  triggerDownload(hiddenElement);
  // Remove its URL
  window.URL.revokeObjectURL(blobUrl);
  removeElement(hiddenElement);
}

function createElement(blobUrl: string, fileName: string): HTMLAnchorElement {
  const hiddenElement: HTMLAnchorElement = document.createElement('a');
  hiddenElement.setAttribute('style', 'display: none;');
  hiddenElement.href = blobUrl;
  hiddenElement.download = fileName;
  return hiddenElement;
}

/**
 * Appends HTML element to DOM and clicks to prompt download
 * @param element: anchor element that points to the file to be downloaded
 */
function triggerDownload(element: HTMLAnchorElement) {
  document.body.appendChild(element);
  element.click();
}

/**
 * Removes the attached HTML element
 * @param element : the attached element to be removed
 */
function removeElement(element: HTMLAnchorElement) {
  document.body.removeChild(element);
  element.remove();
}
