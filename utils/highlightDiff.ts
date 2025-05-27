import { diff_match_patch, DIFF_INSERT, DIFF_DELETE, DIFF_EQUAL } from 'diff-match-patch';

// ✅ Evidenzia le differenze tra originale e raffinato
export default function highlightDiff(original: string, refined: string): string {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(original, refined);
  dmp.diff_cleanupSemantic(diffs);

  return diffs
    .map(([type, text]) => {
      if (type === DIFF_INSERT) return `<span class="diff-added">${text}</span>`;
      if (type === DIFF_DELETE) return `<span class="diff-removed">${text}</span>`;
      return `<span class="diff-neutral">${text}</span>`;
    })
    .join('');
}