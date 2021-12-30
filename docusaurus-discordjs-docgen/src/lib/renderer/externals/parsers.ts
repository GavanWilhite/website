import { isNullishOrEmpty } from '@sapphire/utilities';
import type { Documentation } from '../../types/docgen-output';
import { resolveClasses as resolveDiscordjsClasses } from './discordjs/resolveClasses';
import { resolveTypeDefs as resolveDiscordjsTypedefs } from './discordjs/resolveTypedefs';
import { resolveCss } from './mdn/resolveCss';
import { resolveDom } from './mdn/resolveDom';
import { resolveGlobals } from './mdn/resolveGlobals';
import { resolveClasses as resolveSapphireClasses } from './sapphire/resolveClasses';
import { resolveNamespaces as resolveSapphireNamespaces } from './sapphire/resolveNamespaces';
import { resolveTypeDefs as resolveSapphireTypedefs } from './sapphire/resolveTypeDefs';

const linkExtractorRegex = /{@link (?<match>[A-Za-z.]+)}/g;
const genericTypeInfillRegex = /(?:(?:\[`)?[A-Za-z]+(?:`\]?)(?:\([\.A-Za-z\/]+\)))?<(?<match>[A-Za-z]+)>/g;
const genericTypeRegex = /(?<match>[A-Za-z]+)(?:<\[?[A-Za-z]+\]?(?:\([\.A-Za-z\/]+\))?\\?>)?/g;

type ReplaceArgs = [string, ...unknown[]];
let hasReplacedWithLinkRegex = false;

export function parseDocsLinks(jsonFileContent: Documentation, content: string) {
	// Early exit if there is nothing to parse
	if (isNullishOrEmpty(content)) return content;

	content = content.replace(linkExtractorRegex, (match, ...args: ReplaceArgs) =>
		parseSapphireExternals({
			args,
			isLinkReplacement: true,
			jsonFileContent,
			match
		})
	);

	if (!hasReplacedWithLinkRegex) {
		content = content.replace(genericTypeRegex, (match, ...args: ReplaceArgs) =>
			parseSapphireExternals({
				args,
				isLinkReplacement: false,
				jsonFileContent,
				match
			})
		);

		content = content.replace(genericTypeInfillRegex, (match, ...args: ReplaceArgs) =>
			parseSapphireExternals({
				args,
				isLinkReplacement: false,
				jsonFileContent,
				match
			})
		);
	}

	hasReplacedWithLinkRegex = false;
	content = content.replace(linkExtractorRegex, (match, ...args: ReplaceArgs) =>
		parseDiscordjsExternals({
			args,
			isLinkReplacement: true,
			match
		})
	);

	if (!hasReplacedWithLinkRegex) {
		content = content.replace(genericTypeRegex, (match, ...args: ReplaceArgs) =>
			parseDiscordjsExternals({
				args,
				isLinkReplacement: false,
				match
			})
		);

		content = content.replace(genericTypeInfillRegex, (match, ...args: ReplaceArgs) =>
			parseDiscordjsExternals({
				args,
				isLinkReplacement: false,
				match
			})
		);
	}

	hasReplacedWithLinkRegex = false;
	content = content.replace(linkExtractorRegex, (match, ...args: ReplaceArgs) =>
		parseMdnExternals({
			args,
			isLinkReplacement: true,
			match
		})
	);

	if (!hasReplacedWithLinkRegex) {
		content = content.replace(genericTypeRegex, (match, ...args: ReplaceArgs) =>
			parseMdnExternals({
				args,
				isLinkReplacement: false,
				match
			})
		);

		content = content.replace(genericTypeInfillRegex, (match, ...args: ReplaceArgs) =>
			parseMdnExternals({
				args,
				isLinkReplacement: false,
				match
			})
		);
	}

	return content;
}

function parseMdnExternals({ match, args: [matchContent], isLinkReplacement }: ParseExternalsParameters) {
	const mdnLink =
		resolveGlobals(matchContent) ?? //
		resolveDom(matchContent) ??
		resolveCss(matchContent);

	if (mdnLink) {
		const markdownText = `[\`${matchContent}\`](${mdnLink})`;

		if (isLinkReplacement) {
			hasReplacedWithLinkRegex = true;

			return markdownText;
		}

		return match.replace(matchContent, markdownText);
	}

	return match;
}

function parseDiscordjsExternals({ match, args: [matchContent], isLinkReplacement }: ParseExternalsParameters) {
	const discordjsLink = resolveDiscordjsClasses(matchContent) ?? resolveDiscordjsTypedefs(matchContent);

	if (discordjsLink) {
		const markdownText = `[\`${matchContent}\`](${discordjsLink})`;

		if (isLinkReplacement) {
			hasReplacedWithLinkRegex = true;

			return markdownText;
		}

		return match.replace(matchContent, markdownText);
	}

	return match;
}

function parseSapphireExternals({ match, jsonFileContent, args: [matchContent], isLinkReplacement }: ParseSapphireExternalsParameters) {
	const sapphireDocsLink =
		resolveSapphireClasses(matchContent, jsonFileContent.classes) ??
		resolveSapphireTypedefs(matchContent, jsonFileContent.typedefs) ??
		resolveSapphireNamespaces(matchContent, jsonFileContent.namespaces);

	if (sapphireDocsLink) {
		const markdownText = `[\`${matchContent}\`](${sapphireDocsLink})`;

		if (isLinkReplacement) {
			hasReplacedWithLinkRegex = true;

			return markdownText;
		}

		return match.replace(matchContent, markdownText);
	}

	return match;
}

interface ParseExternalsParameters {
	match: string;
	args: ReplaceArgs;
	isLinkReplacement: boolean;
}

interface ParseSapphireExternalsParameters extends ParseExternalsParameters {
	jsonFileContent: Documentation;
}
