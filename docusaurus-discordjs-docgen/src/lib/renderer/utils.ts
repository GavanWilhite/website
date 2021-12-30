import { existsSync, mkdirSync, readdirSync, rmdirSync, statSync, unlinkSync } from 'node:fs';
import type { Documentation } from '../types/docgen-output';
import { parseDocsLinks } from './externals/parsers';

export function parseContent(jsonFileContent: Documentation, content: string) {
	content = parseDocsLinks(jsonFileContent, content);

	content = escapeGreaterThanSymbols(content);

	return content;
}

export function parseSee(jsonFileContent: Documentation, see?: string[]) {
	return see?.map((seeItem) => `\n**\`See also:\`** ${parseContent(jsonFileContent, seeItem)}`).join('\n') ?? '';
}

function escapeGreaterThanSymbols(markdown: string) {
	return markdown.replace(/<([A-Za-z]+)>(?!`)/gm, '<$1\\>');
}

export function removeDir(outputDir: string) {
	if (existsSync(outputDir)) {
		const files = readdirSync(outputDir);
		if (files.length > 0) {
			files.forEach((filename) => {
				if (statSync(`${outputDir}/${filename}`).isDirectory()) {
					removeDir(`${outputDir}/${filename}`);
				} else {
					unlinkSync(`${outputDir}/${filename}`);
				}
			});
			rmdirSync(outputDir);
		} else {
			rmdirSync(outputDir);
		}
	}
}

export function createDirIfNotExists(dir: string) {
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
}
