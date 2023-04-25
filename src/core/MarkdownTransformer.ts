import { MarkdownLink } from "./MarkdownLink";

export class MarkdownTransformer {
  private constructor(private readonly markdownText: string) {}

  static create(markdownContent: string) {
    return new MarkdownTransformer(markdownContent);
  }

  transform() {
    const links = this.findAllLinks(this.markdownText);
    const linksRecord = this.generateLinksRecord(links);
    const transformedMarkdown = this.replaceLinksByAnchors(this.markdownText, linksRecord);
    const footnotes = this.generateFootnotes(linksRecord);
    return this.appendFootnotesToMarkdown(transformedMarkdown, footnotes);
  }

  private findAllLinks(markdownText:string) {
    const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
    const matchesAsList = Array.from(markdownText.matchAll(linkRegex));
    const links = matchesAsList.map(match => MarkdownLink.create(match[1], match[2]));
    return this.uniqueLinks(links);
  }

  private uniqueLinks(links:MarkdownLink[]){
    return links.filter((link, index) =>
      links.findIndex(l => l.toEqual(link)) === index);
  }

  private generateLinksRecord(links:MarkdownLink[]): Record<string, MarkdownLink> {
    const recordReducer = (previous:Record<string, MarkdownLink>, current:MarkdownLink, index:number) =>
      ({ ...previous, [`[^anchor${index + 1}]`]: current });

    return links.reduce(recordReducer, {});
  }

  private replaceLinksByAnchors(markdownContent: string, linksRecord: Record<string, MarkdownLink>) {
    const replaceLinkWithAnchor = (content:string, key:string) =>
      content.replaceAll(linksRecord[key].toAnchorFormat(), `${linksRecord[key].text} ${key}`);

    return Object.keys(linksRecord)
      .reduce(replaceLinkWithAnchor, markdownContent);
  }

  private generateFootnotes(linksRecord: Record<string, MarkdownLink>) {
    const anchorToFootnote = (footnoteKey: string) =>
      `${footnoteKey}: ${linksRecord[footnoteKey].url}`;

    return Object.keys(linksRecord)
      .map(anchorToFootnote);
  }

  private appendFootnotesToMarkdown(markdownContent: string, footnotes: string[]):string {
    return [markdownContent, ...footnotes].join("\n\n");
  }
}
