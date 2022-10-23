import type { ParameterParser } from 'typedoc-json-parser';

export function parseParameters(parameters: ParameterParser[]): string {
	if (!parameters.length) return '';

	return `| Name | Type | Description |
| :---: | :---: | :---: | :---: |
${parameters
	.map(
		(parameter) =>
			`| ${parameter.name} | ${parameter.type.toString().replace('/', '\\/')} | ${
				parameter.comment.description ?? 'No description provided.'
			} |`
	)
	.join('\n')}`;
}
