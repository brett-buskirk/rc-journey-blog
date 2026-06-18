// Most migrated posts open their body with the same image used as coverImage,
// which we already render prominently in the article hero. This strips that
// leading duplicate — and only that — so it doesn't show twice. Posts whose
// first image differs from the cover are left untouched.
export default function remarkStripLeadCover() {
  return (tree, file) => {
    const cover = file.data?.astro?.frontmatter?.coverImage;
    if (!cover || !Array.isArray(tree.children) || tree.children.length === 0) return;
    const coverBase = String(cover).split('/').pop();

    const first = tree.children[0];
    let img = null;
    if (first?.type === 'image') img = first;
    else if (first?.type === 'paragraph' && first.children?.length === 1 && first.children[0].type === 'image') {
      img = first.children[0];
    }
    if (img && String(img.url).split('/').pop() === coverBase) {
      tree.children.shift();
    }
  };
}
