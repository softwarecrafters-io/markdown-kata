import { MarkdownLink, MarkdownTransformer } from "../core/MarkdownTransformer";

/* Steps to transform markdown text
1. Find all links in the markdown text
2. Avoid duplicated links
3. Create a record with the links
4. Transform the links to anchor format
5. Replace the links in the text with anchors using previous link dictionary
6. Create the footnotes
6. Append the footnotes to the text
*/

describe('The Markdown Transformer', ()=>{
  it('does not transform a given markdown content that does not contain any links', () => {
    const markdownContent = 'text without links';
    const transformedMarkdown = MarkdownTransformer.create(markdownContent).transform();

    expect(transformedMarkdown).toEqual('text without links')
  });

  it('transforms a given markdown content that contains one link', () => {
    const markdownContent = '[visible text link](url)';
    const transformedMarkdown = MarkdownTransformer.create(markdownContent).transform();

    expect(transformedMarkdown).toEqual('visible text link [^anchor1]\n\n[^anchor1]: url')
  });

  it('transforms a given markdown content that contains multiple links', () => {
    const markdownContent = '[visible text link](url)[other visible text link](other url)';
    const transformedMarkdown = MarkdownTransformer.create(markdownContent).transform();

    expect(transformedMarkdown).toEqual('visible text link [^anchor1]other visible text link [^anchor2]\n\n[^anchor1]: url\n\n[^anchor2]: other url')
  });

  it('transforms a given markdown content that contains multiple links and extra content', () => {
    const markdownContent = 'some text [visible text link](url) some text [other visible text link](other url) some text';
    const transformedMarkdown = MarkdownTransformer.create(markdownContent).transform();

    expect(transformedMarkdown).toEqual('some text visible text link [^anchor1] some text other visible text link [^anchor2] some text\n\n[^anchor1]: url\n\n[^anchor2]: other url')
  });

  it('transforms a given markdown content that contains multiple avoiding duplications', () => {
    const markdownContent = '[visible text link](url)[visible text link](url)';
    const transformedMarkdown = MarkdownTransformer.create(markdownContent).transform();

    expect(transformedMarkdown).toEqual('visible text link [^anchor1]visible text link [^anchor1]\n\n[^anchor1]: url')
  });
});

describe('The Markdown Transformer', ()=>{
  const cases = [
    ['', ''],
    ['text', 'text'],
    ['[visible text link](url)', 'visible text link [^anchor1]\n\n[^anchor1]: url'],
    ['irrelevant [visible text link](url)', 'irrelevant visible text link [^anchor1]\n\n[^anchor1]: url'],
    ['[visible text link](url) irrelevant', 'visible text link [^anchor1] irrelevant\n\n[^anchor1]: url'],
    ['irrelevant [visible text link](url) irrelevant', 'irrelevant visible text link [^anchor1] irrelevant\n\n[^anchor1]: url'],
    ['[visible text link](url)[another visible text](url)', 'visible text link [^anchor1]another visible text [^anchor2]\n\n[^anchor1]: url\n\n[^anchor2]: url'],
    ['[visible text link](url), [another visible text](url)', 'visible text link [^anchor1], another visible text [^anchor2]\n\n[^anchor1]: url\n\n[^anchor2]: url'],
  ]
  it.each(cases)('replaces anchors by foot notes. Input: %s, Expected: %s', (markdownContent:string, expectedMarkdown) => {
      const transformedMarkdown = MarkdownTransformer.create(markdownContent).transform()
      expect(transformedMarkdown).toBe(expectedMarkdown)
    });
});

describe('Find all links', ()=>{
  it('does not find links in a given text that does not contain anyone', () => {
    const markdownContent = 'text without links';
    const allLinks = MarkdownTransformer.create(markdownContent).findAllLinks(markdownContent);

    expect(allLinks).toEqual([])
  });

  it('finds all the links in a given text that contains one', () => {
    const markdownContent = '[visible text link](url)';
    const allLinks = MarkdownTransformer.create(markdownContent).findAllLinks(markdownContent);

    expect(allLinks).toEqual([MarkdownLink.create('visible text link', 'url')])
  });

  it('finds all the links in a given text that contains multiple', () => {
    const markdownContent = '[visible text link](url)[other visible text link](other url)';
    const allLinks = MarkdownTransformer.create(markdownContent).findAllLinks(markdownContent);

    expect(allLinks).toEqual([
      MarkdownLink.create('visible text link', 'url'),
      MarkdownLink.create('other visible text link', 'other url')
    ]);
  });

  it('finds all the links in a given text that contains multiple links and text in the middle', () => {
    const markdownContent = '[visible text link](url) text in the middle [other visible text link](other url)';
    const allLinks = MarkdownTransformer.create(markdownContent).findAllLinks(markdownContent);

    expect(allLinks).toEqual([
      MarkdownLink.create('visible text link', 'url'),
      MarkdownLink.create('other visible text link', 'other url')
    ]);
  });

  it('finds all the links in a given text that contains multiple avoiding duplications', () => {
    const markdownContent = '[visible text link](url)[visible text link](url)';
    const allLinks = MarkdownTransformer.create(markdownContent).findAllLinks(markdownContent);

    expect(allLinks).toEqual([
      MarkdownLink.create('visible text link', 'url'),
    ]);
  });
});

describe('Generate links record', ()=>{
  it('generates a record with the links', () => {
    const markdownContent = '[visible text link](url)';
    const aMarkdownLink = MarkdownLink.create('visible text link', 'url');
    const otherMarkdownLink = MarkdownLink.create('other visible text link', 'other url');
    const links = [aMarkdownLink, otherMarkdownLink];
    const linksRecord = MarkdownTransformer.create(markdownContent).generateLinksRecord(links);

    expect(linksRecord).toEqual({
      ['[^anchor1]']: aMarkdownLink,
      ['[^anchor2]']: otherMarkdownLink,
    })
  });
})

describe('Replace links by anchors', () => {
  it('replaces text links by anchors', () => {
    const markdownContent = '[visible text link](url)';
    const markdownTransformer = MarkdownTransformer.create(markdownContent);
    const links = markdownTransformer.findAllLinks(markdownContent);
    const linksRecord = markdownTransformer.generateLinksRecord(links);

    const transformedMarkdown = markdownTransformer.replaceLinksByAnchors(markdownContent, linksRecord);

    expect(transformedMarkdown).toBe('visible text link [^anchor1]')
  });
});

describe('Create footnotes', () => {
  it('creates footnotes', () => {
    const markdownContent = '[visible text link](url)';
    const markdownTransformer = MarkdownTransformer.create(markdownContent);
    const links = markdownTransformer.findAllLinks(markdownContent);
    const linksRecord = markdownTransformer.generateLinksRecord(links);

    const footnotes = markdownTransformer.generateFootnotes(linksRecord);

    expect(footnotes).toBe('[^anchor1]: url')
  });
});

describe('Append footnotes to markdown', () => {
  it('appends footnotes to markdown', () => {
    const markdownContent = '[visible text link](url)';
    const markdownTransformer = MarkdownTransformer.create(markdownContent);
    const links = markdownTransformer.findAllLinks(markdownContent);
    const linksRecord = markdownTransformer.generateLinksRecord(links);
    const transformedMarkdown = markdownTransformer.replaceLinksByAnchors(markdownContent, linksRecord);
    const footnotes = markdownTransformer.generateFootnotes(linksRecord);

    const transformedMarkdownWithFootnotes = markdownTransformer.appendFootnotesToMarkdown(transformedMarkdown, footnotes);

    expect(transformedMarkdownWithFootnotes).toBe('visible text link [^anchor1]\n\n[^anchor1]: url')
  });
});
