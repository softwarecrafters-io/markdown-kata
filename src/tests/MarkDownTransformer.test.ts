import { MarkdownTransformer } from "../core/MarkdownTransformer";

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
