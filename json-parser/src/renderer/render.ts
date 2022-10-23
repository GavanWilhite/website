import {
	ClassParser,
	VariableParser,
	EnumParser,
	FunctionParser,
	InterfaceParser,
	NamespaceParser,
	ProjectParser,
	ReferenceTypeParser,
	TypeAliasParser
} from 'typedoc-json-parser';
import { renderClasses } from './renderClass';
import { renderVariables } from './renderVariable';
import { renderEnums } from './renderEnum';
import { renderFunctions } from './renderFunction';
import { renderInterfaces } from './renderInterface';
import { renderNamespaces } from './renderNamespace';
import { renderTypeAliases } from './renderTypeAlias';

export function renderOutputFiles(projectParser: ProjectParser, outputDir: string, isGroup: boolean) {
	if (projectParser.classes.length) {
		renderClasses(projectParser, outputDir, isGroup);
	}

	if (projectParser.variables.length) {
		renderVariables(projectParser, outputDir, isGroup);
	}

	if (projectParser.enums.length) {
		renderEnums(projectParser, outputDir, isGroup);
	}

	if (projectParser.functions.length) {
		renderFunctions(projectParser, outputDir, isGroup);
	}

	if (projectParser.interfaces.length) {
		renderInterfaces(projectParser, outputDir, isGroup);
	}

	if (projectParser.namespaces.length) {
		renderNamespaces(projectParser, outputDir, isGroup);
	}

	if (projectParser.typeAliases.length) {
		renderTypeAliases(projectParser, outputDir, isGroup);
	}
}

ReferenceTypeParser.formatToString = (parser) => {
	const typeArguments = parser.typeArguments.length > 0 ? `<${parser.typeArguments.map((type) => type.toString()).join(', ')}>` : '';

	if (parser.id !== null && parser.packageName === null) {
		const foundParser = parser.project.find(parser.id);

		if (foundParser !== null) {
			if (foundParser instanceof ClassParser) {
				return `[${parser.name}](../class/${foundParser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			} else if (foundParser instanceof VariableParser) {
				return `[${parser.name}](../constant/${foundParser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			} else if (foundParser instanceof EnumParser) {
				return `[${parser.name}](../enum/${foundParser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			} else if (foundParser instanceof FunctionParser) {
				return `[${parser.name}](../function/${foundParser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			} else if (foundParser instanceof InterfaceParser) {
				return `[${parser.name}](../interface/${foundParser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			} else if (foundParser instanceof NamespaceParser) {
				return `[${parser.name}](../namespace/${foundParser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			} else if (foundParser instanceof TypeAliasParser) {
				return `[${parser.name}](../type-alias/${foundParser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			}
		}
	}

	// TODO: Parse `parser.packageName`

	return `${parser.packageName ? `${parser.packageName}.` : ''}${parser.name}${typeArguments}`;
};
