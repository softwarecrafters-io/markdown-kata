export class MarkdownLink {
  private constructor(readonly text: string, readonly url: string) {}

  static create(text: string, url: string) {
    return new MarkdownLink(text, url);
  }

  toEqual(other: MarkdownLink) {
    return this.text === other.text && this.url === other.url;
  }

  toAnchorFormat() {
    return `[${this.text}](${this.url})`;
  }
}
