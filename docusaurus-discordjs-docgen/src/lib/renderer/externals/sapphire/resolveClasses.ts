import type { DocumentationClass } from '../../../types/docgen-output';
import { resolveExternalPackage } from './resolveExternalPackage';

export function resolveClasses(name: string, allClasses: DocumentationClass[]): string | undefined {
	const allClassNames = allClasses.map((c) => c.name);
	const docMeta = allClasses.find((c) => c.name === name)?.meta;

	if (allClassNames.includes(name)) {
		const externalPackage = resolveExternalPackage(docMeta);

		if (externalPackage) {
			return `../../${externalPackage}/class/${name.toLowerCase().replace(/\s/g, '-')}.mdx`;
		}

		return `../class/${name.toLowerCase().replace(/\s/g, '-')}.mdx`;
	}

	return undefined;
}
