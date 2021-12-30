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

			const contents = (
				await (githubToken
					? fetch<RepositoryContent[]>(githubContentUrl, {
							headers: {
								Authorization: `Bearer ${githubToken}`
							}
					  })
					: fetch<RepositoryContent[]>(githubContentUrl))
			).filter((content) => content.type === RepositoryContentFileType.Directory);

			for (const content of contents) {
				const projectContents = await fetch<RepositoryContent[]>(content.url, {
					headers: {
						Authorization: `Bearer ${githubToken}`
					}
				});

				for (const projectContent of projectContents) {
					if (projectContent.type === RepositoryContentFileType.Directory) {
						const projectSubContents = await fetch<RepositoryContent[]>(projectContent.url, {
							headers: {
								Authorization: `Bearer ${githubToken}`
							}
						});

						writeCategoryYaml(resolve(siteDir, 'docs', 'Documentation', content.name), '', content.name, 0);

						for (const projectSubContent of projectSubContents) {
							if (projectSubContent.download_url === null)
								throw new Error(
									`The 'download_url' field is null for '${content.name}/${projectContent.name}/${projectSubContent.name}'`
								);

							writeCategoryYaml(
								resolve(siteDir, 'docs', 'Documentation', content.name, projectContent.name),
								'',
								projectContent.name,
								1
							);

							const outputDir = resolve(
								siteDir,
								'docs',
								'Documentation',
								content.name,
								projectContent.name,
								projectSubContent.name.replace('.json', '')
							);

							removeDirectory(outputDir);

							writeCategoryYaml(outputDir, '', projectSubContent.name.replace('.json', ''), 1);

							const data = await fetch<ProjectParser.JSON>(projectSubContent.download_url);
							const incomingTypeDocJsonParserVersion = data.typeDocJsonParserVersion.split('.').map(Number) as [number, number, number];
							const currentTypeDocJsonParserVersion = ProjectParser.version.split('.').map(Number) as [number, number, number];

							if (incomingTypeDocJsonParserVersion[0] !== currentTypeDocJsonParserVersion[0]) continue;

							const projectParser = new ProjectParser({ data, version: projectSubContent.name.replace('.json', '') });

							renderOutputFiles(projectParser, outputDir, true);
						}
					} else {
						if (projectContent.download_url === null)
							throw new Error(`The 'download_url' field is null for '${content.name}/${projectContent.name}'`);

						writeCategoryYaml(resolve(siteDir, 'docs', 'Documentation', content.name), '', content.name, 0);

						const outputDir = resolve(siteDir, 'docs', 'Documentation', content.name, projectContent.name.replace('.json', ''));

						removeDirectory(outputDir);

						writeCategoryYaml(outputDir, '', projectContent.name.replace('.json', ''), 1);

						const data = await fetch<ProjectParser.JSON>(projectContent.download_url);
						const incomingTypeDocJsonParserVersion = data.typeDocJsonParserVersion.split('.').map(Number) as [number, number, number];
						const currentTypeDocJsonParserVersion = ProjectParser.version.split('.').map(Number) as [number, number, number];

						if (incomingTypeDocJsonParserVersion[0] !== currentTypeDocJsonParserVersion[0]) continue;

						const projectParser = new ProjectParser({ data, version: projectContent.name.replace('.json', '') });

						renderOutputFiles(projectParser, outputDir, false);
					}
				}
			}
		}
	};
}
