import { fetch } from '@sapphire/fetch';
import { blue, bold } from 'colorette';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	ClassParser,
	EnumParser,
	FunctionParser,
	InterfaceParser,
	NamespaceParser,
	ProjectParser,
	ReferenceTypeParser,
	TypeAliasParser,
	VariableParser
} from 'typedoc-json-parser';
import { renderOutputFiles } from './renderer/render';
import { removeDirectory } from './renderer/utilities/removeDirectory';
import { writeCategoryYaml } from './renderer/writeCategoryYaml';
import type { PluginOptions } from './types/PluginOptions';
import { RepositoryContent, RepositoryContentFileType } from './types/RepositoryContent';

ReferenceTypeParser.formatToString = (options) => {
	const { parser, project } = options;
	const typeArguments = parser.typeArguments.length > 0 ? `<${parser.typeArguments.map((type) => type.toString()).join(', ')}\\>` : '';

	if (parser.id) {
		const found = project?.find(parser.id);

		if (found && 'external' in found && !found.external) {
			if (found instanceof NamespaceParser) {
				return `[\`${parser.name}\`](../namespace/${parser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			} else if (found instanceof ClassParser) {
				return `[\`${parser.name}\`](../class/${parser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			} else if (found instanceof FunctionParser) {
				return `[\`${parser.name}\`](../function/${parser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			} else if (found instanceof InterfaceParser) {
				return `[\`${parser.name}\`](../interface/${parser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			} else if (found instanceof TypeAliasParser) {
				return `[\`${parser.name}\`](../type-alias/${parser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			} else if (found instanceof EnumParser) {
				return `[\`${parser.name}\`](../enum/${parser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			} else if (found instanceof VariableParser) {
				return `[\`${parser.name}\`](../variable/${parser.name.toLowerCase().replace(/\s/g, '-')}.mdx)${typeArguments}`;
			}
		}
	}

	if (parser.packageName) return `[\`${parser.name}\`](package::${parser.packageName})${typeArguments}`;

	return `\`${parser.name}\`${typeArguments}`;
};

export async function docusaurusTypeDocJsonParser(options: PluginOptions) {
	const siteDir = fileURLToPath(new URL('../../', import.meta.url));
	const { githubContentUrl, githubToken } = options;

	const headers = new Headers();

	if (githubToken) {
		headers.append('Authorization', `Bearer ${githubToken}`);
	}

	console.info(blue(`${bold('[INFO]')} Fetching GitHub API...`));

	const repositoryContents = await fetch<RepositoryContent[]>(githubContentUrl, { headers });
	const repositoryDirectories = repositoryContents.filter((content) => content.type === RepositoryContentFileType.Directory);

	for (const directory of repositoryDirectories) {
		const directoryContents = await fetch<RepositoryContent[]>(directory.url, { headers });

		for (const directoryContent of directoryContents) {
			if (directoryContent.type === RepositoryContentFileType.Directory) {
				const subDirectoryContents = await fetch<RepositoryContent[]>(directoryContent.url, { headers });

				writeCategoryYaml(resolve(siteDir, 'docs', 'Documentation', directory.name), '', directory.name, 0);

				for (const subDirectoryContent of subDirectoryContents) {
					if (subDirectoryContent.download_url === null)
						throw new Error(
							`The 'download_url' field is null for '${directory.name}/${directoryContent.name}/${subDirectoryContent.name}'`
						);

					writeCategoryYaml(resolve(siteDir, 'docs', 'Documentation', directory.name, directoryContent.name), '', directoryContent.name, 1);

					const outputDir = resolve(
						siteDir,
						'docs',
						'Documentation',
						directory.name,
						directoryContent.name,
						subDirectoryContent.name.replace('.json', '')
					);

					removeDirectory(outputDir);

					writeCategoryYaml(outputDir, '', subDirectoryContent.name.replace('.json', ''), 1);

					const data = await fetch<ProjectParser.Json>(subDirectoryContent.download_url);
					const incomingTypeDocJsonParserVersion = data.typeDocJsonParserVersion.split('.').map(Number) as [number, number, number];
					const currentTypeDocJsonParserVersion = ProjectParser.version.split('.').map(Number) as [number, number, number];

					if (incomingTypeDocJsonParserVersion[0] !== currentTypeDocJsonParserVersion[0]) continue;

					const projectParser = new ProjectParser({ data, version: subDirectoryContent.name.replace('.json', '') });

					renderOutputFiles(projectParser, outputDir, true);
				}
			} else {
				if (directoryContent.download_url === null)
					throw new Error(`The 'download_url' field is null for '${directory.name}/${directoryContent.name}'`);

				writeCategoryYaml(resolve(siteDir, 'docs', 'Documentation', directory.name), '', directory.name, 0);

				const outputDir = resolve(siteDir, 'docs', 'Documentation', directory.name, directoryContent.name.replace('.json', ''));

				removeDirectory(outputDir);

				writeCategoryYaml(outputDir, '', directoryContent.name.replace('.json', ''), 1);

				const data = await fetch<ProjectParser.Json>(directoryContent.download_url);
				const incomingTypeDocJsonParserVersion = data.typeDocJsonParserVersion.split('.').map(Number) as [number, number, number];
				const currentTypeDocJsonParserVersion = ProjectParser.version.split('.').map(Number) as [number, number, number];

				if (incomingTypeDocJsonParserVersion[0] !== currentTypeDocJsonParserVersion[0]) continue;

				const projectParser = new ProjectParser({ data, version: directoryContent.name.replace('.json', '') });

				renderOutputFiles(projectParser, outputDir, false);
			}
		}
	}
}
