import { visit } from 'unist-util-visit';

export default function rehypeGallery() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'h2' || !parent || index == null) return;

      const text = node.children
        .filter((c) => c.type === 'text')
        .map((c) => c.value)
        .join('')
        .trim();
      if (text !== 'Gallery') return;

      // Find the next meaningful sibling (skip whitespace text nodes)
      let nextIdx = index + 1;
      while (
        nextIdx < parent.children.length &&
        parent.children[nextIdx].type === 'text' &&
        /^\s*$/.test(parent.children[nextIdx].value)
      ) {
        nextIdx++;
      }
      const next = parent.children[nextIdx];
      if (!next || next.tagName !== 'p') return;

      const imgs = next.children.filter(
        (c) => c.type === 'element' && c.tagName === 'img',
      );
      if (imgs.length === 0) return;

      const figures = imgs.map((img) => ({
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: [
          img,
          ...(img.properties?.alt
            ? [
                {
                  type: 'element',
                  tagName: 'figcaption',
                  properties: {},
                  children: [{ type: 'text', value: img.properties.alt }],
                },
              ]
            : []),
        ],
      }));

      const galleryDiv = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['gallery-grid'] },
        children: figures,
      };

      // Remove the h2 and the paragraph (+ any whitespace nodes between them),
      // insert the gallery div in their place.
      const deleteCount = nextIdx - index + 1;
      parent.children.splice(index, deleteCount, galleryDiv);
    });
  };
}
