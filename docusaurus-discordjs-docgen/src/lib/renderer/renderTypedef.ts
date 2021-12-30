import { writeFileSync } from 'fs';
import { resolve } from 'path';
import type { Documentation, DocumentationTypeDefinition } from '../types/docgen-output';
import { parseContent, parseSee } from './utils';
import { writeCategoryYaml } from './writeCategoryYaml';

function renderTypedef(jsonFileContent: Documentation, docTypedef: DocumentationTypeDefinition, outputDir: string, sidebarPosition: number) {
	const slug = docTypedef.name.toLowerCase().replace(/\s/g, '-');

	const typedefHeader = [
		'---',
		`id: "${slug}"`,
		`title: "${docTypedef.name}"`,
		`sidebar_label: "${docTypedef.name}"`,
		`sidebar_position: ${sidebarPosition}`,
		`custom_edit_url: null`,
		'---'
	].join('\n');

	const typedefDescription = docTypedef.description ?? '';
	const typedefExtendedDescription = docTypedef.extendedDescription ?? '';

	let typedefResult = `${typedefHeader}

${parseContent(jsonFileContent, typedefDescription)}

${parseContent(jsonFileContent, typedefExtendedDescription)}
${parseSee(jsonFileContent, docTypedef.see)}
`;

	switch (docTypedef.variant) {
		case 'enum':
			typedefResult += parseEnum(jsonFileContent, docTypedef);

			break;

		case 'interface':
			typedefResult += parseInterface(jsonFileContent, docTypedef);

			break;

		case 'type':
			break;
	}

	writeFileSync(resolve(outputDir, `${slug}.mdx`), typedefResult);
}

export function renderTypedefs(jsonFileContent: Documentation, documentationTypedefs: DocumentationTypeDefinition[], outputDir: string) {
	const categoryDir = writeCategoryYaml(outputDir, 'typedef', 'Type Definitions', 1);

	let fileSidebarPosition = 0;
	for (const documentationTypedef of documentationTypedefs) {
		if (documentationTypedef.isExternal) continue;

		renderTypedef(jsonFileContent, documentationTypedef, categoryDir, fileSidebarPosition);

		fileSidebarPosition++;
	}
}

function parseEnum(jsonFileContent: Documentation, dEnum: DocumentationTypeDefinition) {
	const props = dEnum.props ?? [];

	if (props.length === 0) return '## Empty Enum';

	let enumResult = props.some((prop) => prop.description)
		? `| Property | Value | Description |
| :---: | :---: | :---: |
`
		: `| Property | Value |
| :---: | :---: |
`;

	for (const prop of dEnum.props ?? []) {
		enumResult += props.some((prop) => prop.description)
			? `| ${prop.name} | ${parseContent(jsonFileContent, prop.type.flat(2).join(''))} | ${parseContent(
					jsonFileContent,
					prop.description ?? 'N/A'
			  )} |
`
			: `| ${prop.name} | ${parseContent(jsonFileContent, prop.type.flat(2).join(''))} |
`;
	}

	return enumResult;
}

function parseInterface(jsonFileContent: Documentation, dInterface: DocumentationTypeDefinition) {
	const props = dInterface.props ?? [];

	if (props.length === 0) return '## Empty Interface';

	let enumResult = props.some((prop) => prop.description)
		? `| Property | Type | Optional | Description |
| :---: | :---: | :---: | :---: |
`
		: `| Property | Type | Optional |
| :---: | :---: | :---: |
`;

	for (const prop of dInterface.props ?? []) {
		enumResult += props.some((prop) => prop.description)
			? `| ${prop.name} | ${parseContent(jsonFileContent, prop.type.flat(2).join(''))} | ${prop.optional ? 'Yes' : 'No'} | ${parseContent(
					jsonFileContent,
					prop.description ?? 'N/A'
			  )} |
`
			: `| ${prop.name} | ${parseContent(jsonFileContent, prop.type.flat(2).join(''))} | ${prop.optional ? 'Yes' : 'No'} |
`;
	}

	return enumResult;
}
