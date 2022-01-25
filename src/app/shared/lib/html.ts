export function escapeHTML(unsafe: string): string {
  return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function replaceNewlinesWithBreakLines(text: string): string {
  return text.replace(/\n/g, '<br/>');
}
