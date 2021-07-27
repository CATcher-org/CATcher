export function createAndDownloadFile(fileName:string, content: string) {
    const blob: Blob = new Blob([content], {type: 'file/txt'});
    const blobUrl: string = window.URL.createObjectURL(blob);

    const hiddenElement: HTMLAnchorElement = createElement(blobUrl, fileName);

    downloadElement(hiddenElement);

    removeElement(blobUrl, hiddenElement);
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
 * @param element: the file to be downloaded
 */
function downloadElement(element: HTMLAnchorElement) {
    document.body.appendChild(element);
    element.click();
}

/**
 * Removes the attached HTML element and its URL
 * @param blobUrl : URL of the element
 * @param element : the attached element to be removed
 */
function removeElement(blobUrl: string, element: HTMLAnchorElement) {
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(element);
    element.remove();
}