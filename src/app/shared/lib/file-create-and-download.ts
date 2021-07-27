export function createAndDownloadFile(fileName:string, content: string) {
    const blob: Blob = new Blob([content], {type: 'file/txt'});
    const blobUrl: string = window.URL.createObjectURL(blob);

    const hiddenElement: HTMLAnchorElement = document.createElement('a');
    hiddenElement.setAttribute('style', 'display: none;');
    hiddenElement.href = blobUrl;
    hiddenElement.download = fileName;

    // Add to DOM and Click to prompt download.
    document.body.appendChild(hiddenElement);
    hiddenElement.click();

    // Remove URL + Created Attached Element
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(hiddenElement);
    hiddenElement.remove();
}