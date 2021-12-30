import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { EnumParser, ProjectParser } from 'typedoc-json-parser';
import { writeCategoryYaml } from './writeCategoryYaml';

function renderEnum(enumParser: EnumParser, outputDir: string, fileSidebarPosition: number) {
	const slug = enumParser.name.toLowerCase().replace(/\s/g, '-');

	const header = `---
id: "${slug}"
title: "${enumParser.name}"
sidebar_label: "${enumParser.name}"
sidebar_position: ${fileSidebarPosition}
custom_edit_url: null
---`;

	const result = `${header}`;

	writeFileSync(resolve(outputDir, `${slug}.mdx`), result);
}

export function renderEnums(projectParser: ProjectParser, outputDir: string, isGroup: boolean) {
	const categoryDir = writeCategoryYaml(outputDir, 'enum', 'Enums', isGroup ? 2 : 1);

	let fileSidebarPosition = 0;

	for (const enumParser of projectParser.enums) {
		if (enumParser.external) continue;

		renderEnum(enumParser, categoryDir, fileSidebarPosition);

		fileSidebarPosition++;
	}
}
