import type { CommentParser } from 'typedoc-json-parser';

export function parseExamples(blockTags: CommentParser.BlockTag[]): string {
	if (blockTags.length === 0) return '';

	return `${blockTags.map((blockTag) => blockTag.text.replace(/(```typescript)\n/g, '$1 ts2esm2cjs\n'))}`;
}
