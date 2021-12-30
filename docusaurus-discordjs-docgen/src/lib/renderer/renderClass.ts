import { isNullishOrEmpty } from '@sapphire/utilities';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Documentation, DocumentationClass } from '../types/docgen-output';
import { pluginContainer } from '../utils/pluginContainer';
import { parseContent, parseSee } from './utils';
import { writeCategoryYaml } from './writeCategoryYaml';

function renderClass(jsonFileContent: Documentation, docClass: DocumentationClass, outputDir: string, sidebarPosition: number) {
	const slug = docClass.name.toLowerCase().replace(/\s/g, '-');

	const classHeader = [
		'---',
		`id: "${slug}"`,
		`title: "${docClass.name}"`,
		`sidebar_label: "${docClass.name}"`,
		`sidebar_position: ${sidebarPosition}`,
		`custom_edit_url: null`,
		'---'
	].join('\n');

	const classExtends = parseClassExtendsAndImplements(docClass.extends);
	const classImplements = parseClassExtendsAndImplements(docClass.implements);

	const classDescription = docClass.description ?? '';
	const classExtendedDescription = docClass.extendedDescription ?? '';

	const classResult = `${classHeader}
${isNullishOrEmpty(classExtends) ? '' : `**extends ${parseContent(jsonFileContent, classExtends)}**`}
${isNullishOrEmpty(classImplements) ? '' : `**implements ${parseContent(jsonFileContent, classImplements)}**`}

${parseContent(jsonFileContent, classDescription)}

${parseContent(jsonFileContent, classExtendedDescription)}
${parseSee(jsonFileContent, docClass.see)}

${parseExamples(docClass.examples)}

${parseConstructor(jsonFileContent, docClass)}
${parseProperties(jsonFileContent, docClass)}
`;

	writeFileSync(resolve(outputDir, `${slug}.mdx`), classResult);
}

export function renderClasses(jsonFileContent: Documentation, documentationClasses: DocumentationClass[], outputDir: string) {
	const categoryDir = writeCategoryYaml(outputDir, 'class', 'Classes', 1);

	let fileSidebarPosition = 0;
	for (const documentationClass of documentationClasses) {
		if (documentationClass.isExternal) continue;

		renderClass(jsonFileContent, documentationClass, categoryDir, fileSidebarPosition);

		fileSidebarPosition++;
	}
}

function parseClassExtendsAndImplements(classExtends?: string[] | string[][]) {
	if (!classExtends) return '';

	const zeroEntry = classExtends?.[0];

	if (Array.isArray(zeroEntry)) {
		return zeroEntry.join(', ');
	}

	return zeroEntry;
}

function parseExamples(examples?: string[]) {
	if (isNullishOrEmpty(examples)) return '';

	let examplesString = '## Examples\n\n';

	for (const example of examples) {
		const exampleWithPlugin = example.replace(/(```typescript)\n/g, '$1 ts2esm2cjs\n');

		examplesString += `${exampleWithPlugin}\n\n`;
	}

	return examplesString;
}

function parseConstructor(jsonFileContent: Documentation, dClass: DocumentationClass) {
	const classConstructorParameters = dClass.construct?.params?.map((param) => param.name).join(', ');

	return `## Constructor

\`\`\`typescript ts2esm2cjs
import { ${dClass.name} } from '${pluginContainer.pluginOptions.packageName}';

new ${dClass.name}(${classConstructorParameters});
\`\`\`

| Parameter | Type | Optional | Default | Description |
| :---: | :---: | :---: | :---: | :---: |
${dClass.construct?.params
	?.map(
		(param) =>
			`| ${param.name} | ${parseContent(jsonFileContent, param.type.flat(2).join(''))} | ${param.optional ? 'Yes' : 'No'} | ${
				param.default ?? ''
			} | ${parseContent(jsonFileContent, param.description ?? 'N/A')} |`
	)
	.join('\n')}`;
}

function parseProperties(jsonFileContent: Documentation, dClass: DocumentationClass) {
	const props = dClass.props ?? [];

	if (props.length === 0) return '';

	// TODO: Add support for modifiers like, optional, readonly, etc.

	return `## Properties

${props
	.map(
		(prop) => `### .${prop.name}**

${parseContent(jsonFileContent, prop.description ?? '')}

**Type**: ${parseContent(jsonFileContent, prop.type.flat(2).join(''))}
`
	)
	.join('')}`;
}
