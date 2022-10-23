import type { LoadContext, Plugin } from '@docusaurus/types';
import { fetch } from '@sapphire/fetch';
import type { PluginOptions } from './types/PluginOptions';
import { RepositoryContent, RepositoryContentFileType } from './types/RepositoryContent';
import { ProjectParser, ReferenceTypeParser } from 'typedoc-json-parser';
import { resolve } from 'node:path';
import { removeDirectory } from './renderer/utilities/removeDirectory';
import { writeCategoryYaml } from './renderer/writeCategoryYaml';
import { renderOutputFiles } from './renderer/render';

ReferenceTypeParser.formatToString = (parser) => {
	const typeArguments = parser.typeArguments.length > 0 ? `<${parser.typeArguments.map((type) => type.toString()).join(', ')}\\>` : '';

	if (parser.id || parser.packageName) {
		return `[\`${parser.name}\`](${parser.id ? parser.id : parser.packageName})${typeArguments}`;
	}

	return `\`${parser.name}\`${typeArguments}`;
};

export default function docusaurusTypeDocJsonParser(context: LoadContext, options: PluginOptions): Plugin {
	return {
		name: 'docusaurus-typedoc-json-parser',
		async loadContent() {
			const { siteDir } = context;
			const { githubContentUrl, githubToken } = options;

			const headers = new Headers();

			if (githubToken) {
				headers.append('Authorization', `Bearer ${githubToken}`);
			}

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

							writeCategoryYaml(
								resolve(siteDir, 'docs', 'Documentation', directory.name, directoryContent.name),
								'',
								directoryContent.name,
								1
							);

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

							const data = await fetch<ProjectParser.JSON>(subDirectoryContent.download_url);
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

						const data = await fetch<ProjectParser.JSON>(directoryContent.download_url);
						const incomingTypeDocJsonParserVersion = data.typeDocJsonParserVersion.split('.').map(Number) as [number, number, number];
						const currentTypeDocJsonParserVersion = ProjectParser.version.split('.').map(Number) as [number, number, number];

						if (incomingTypeDocJsonParserVersion[0] !== currentTypeDocJsonParserVersion[0]) continue;

						const projectParser = new ProjectParser({ data, version: directoryContent.name.replace('.json', '') });

						renderOutputFiles(projectParser, outputDir, false);
					}
				}
			}
		}
	};
}
