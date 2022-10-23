import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { FunctionParser, ProjectParser } from 'typedoc-json-parser';
import { parseSignatures } from './utilities/parseSignatures';
import { writeCategoryYaml } from './writeCategoryYaml';

function renderFunction(functionParser: FunctionParser, outputDir: string, fileSidebarPosition: number) {
	const slug = functionParser.name.toLowerCase().replace(/\s/g, '-');

	const header = `---
id: "${slug}"
title: "${functionParser.name}"
sidebar_label: "${functionParser.name}"
sidebar_position: ${fileSidebarPosition}
custom_edit_url: null
---`;

	const result = `${header}

${functionParser.signatures.length > 1 ? `## Signatures` : ''}

${parseSignatures(functionParser.signatures)}`;

	writeFileSync(resolve(outputDir, `${slug}.mdx`), result);
}

export function renderFunctions(projectParser: ProjectParser, outputDir: string, isGroup: boolean) {
	if (projectParser.functions.every((functionParser) => !functionParser.external)) {
		const categoryDir = writeCategoryYaml(outputDir, 'function', 'Functions', isGroup ? 2 : 1);

		let fileSidebarPosition = 0;

		for (const functionParser of projectParser.functions) {
			if (functionParser.external) continue;

			renderFunction(functionParser, categoryDir, fileSidebarPosition);

			fileSidebarPosition++;
		}
	}
}
