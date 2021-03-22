import { MarkedOptions, MarkedRenderer } from "ngx-markdown";

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();
  const linkRenderer = renderer.link;

  function checkRegex(href): boolean {
    const regex = /^(?:http:\/\/|https:\/\/)|(?!-)([A-Za-z0-9-]+(\.|-))+([A-Za-z]+)(?!-)$/g;
    return regex.test(href);
  }

  renderer.link = (href, title, text) => {
    if (checkRegex(href)) {
      if (!href.includes('http://') && !href.includes('https://')) {
        href = `https://${href}`;
      }
      return linkRenderer.call(renderer, href, title, text);
    } else {
      const html = linkRenderer.call(renderer, href, title, text);
      console.log(html);
      return html.replace(/^<a /, '<a class="invalid-link ');
    }
  };

  return {
    renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
  };
}
