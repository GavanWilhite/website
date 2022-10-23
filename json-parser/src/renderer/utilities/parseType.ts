import type { TypeParser } from 'typedoc-json-parser';
import { bold, yellow } from 'colorette';

export function parseType(type: TypeParser): string {
	return type.toString().replace(/\[`(?<name>\D[^\]]+)`\]\(package::(?<package>\D[^<\\>\[\]`]+)\)/gm, (match, name, packageName) => {
		console.warn(yellow(`${bold('[WARN]')} Unable to find parser for ${name} (${packageName})`));

		return match;
	});
}
