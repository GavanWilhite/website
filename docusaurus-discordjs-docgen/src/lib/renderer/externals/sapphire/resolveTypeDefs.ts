import type { DocumentationTypeDefinition } from '../../../types/docgen-output';
import { resolveExternalPackage } from './resolveExternalPackage';

export function resolveTypeDefs(name: string, allTypedefs: DocumentationTypeDefinition[]): string | undefined {
	const allTypedefNames = allTypedefs.map((c) => c.name);
	const docMeta = allTypedefs.find((c) => c.name === name)?.meta;

	if (allTypedefNames.includes(name)) {
		const externalPackage = resolveExternalPackage(docMeta);

		if (externalPackage) {
			return `../../${externalPackage}/typedef/${name.toLowerCase().replace(/\s/g, '-')}.mdx`;
		}

		return `../typedef/${name.toLowerCase().replace(/\s/g, '-')}.mdx`;
	}

	return undefined;
}
