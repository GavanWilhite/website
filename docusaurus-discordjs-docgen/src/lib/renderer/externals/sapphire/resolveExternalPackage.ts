import type { DocumentationClassMeta } from '../../../types/docgen-output';

export function resolveExternalPackage(meta?: DocumentationClassMeta) {
	if (!meta?.path) return null;

	if (!meta.path.includes('@sapphire')) return null;

	return meta.path.replace(/.+@(sapphire)\/([0-9a-zA-Z\-\.]+).+/, '$1-$2');
}
