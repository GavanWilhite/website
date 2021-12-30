/**
 * Copyright (c) 2021 iCrawl
 * Copyright (c) 2020 Federico Grandi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

interface DocumentationMeta {
	date: number;
	format: number;
	generator: string;
}

export interface DocumentationClassMeta {
	file: string;
	line: number;
	path: string;
}
type DocumentationClassMethodMeta = DocumentationClassMeta;

type DocumentationClassMethodParameterMeta = DocumentationClassMeta;

type DocumentationClassMethodPropertyMeta = DocumentationClassMeta;

type DocumentationClassEventMeta = DocumentationClassMeta;

type DocumentationExternalMeta = DocumentationClassMeta;

type DocumentationTypeDefinitionMeta = DocumentationClassMeta;

type DocumentationTypeDefinitionParameterMeta = DocumentationClassMeta;

export interface DocumentationTypeAlias {
	meta: DocumentationClassMeta;
	name: string;
	type?: string[][][];
}

export interface DocumentationInterface {
	meta: DocumentationClassMethodPropertyMeta;
	name: string;
	props: DocumentationClassPropertyProperty[];
}

export interface DocumentationParameter {
	abstract?: boolean;
	access?: string;
	default: string;
	deprecated?: boolean | string;
	description?: string;
	name: string;
	nullable?: boolean;
	optional?: boolean;
	readonly?: boolean;
	scope?: string;
	see?: string[];
	type: string[][][];
	variable?: boolean;
}

type DocumentationClassConstructorParameter = DocumentationParameter;

type DocumentationClassEventParameter = DocumentationParameter;

interface DocumentationClassMethodParameter extends DocumentationParameter {
	meta: DocumentationClassMethodParameterMeta;
}

interface DocumentationTypeDefinitionParameter extends DocumentationParameter {
	meta: DocumentationTypeDefinitionParameterMeta;
}

type DocumentationProperty = DocumentationParameter;

type DocumentationTypeDefinitionProperty = DocumentationProperty;

type DocumentationClassPropertyProperty = DocumentationProperty;

export interface DocumentationClassProperty extends DocumentationProperty {
	meta: DocumentationClassMethodPropertyMeta;
	props: DocumentationClassPropertyProperty[];
}

export interface DocumentationClassConstructor {
	name: string;
	params?: DocumentationClassConstructorParameter[];
}

export interface DocumentationReturns {
	description: string;
	nullable: boolean;
	types: string[][][];
	variable: boolean;
}

export interface DocumentationClassMethod {
	abstract?: boolean;
	access?: string;
	async?: boolean;
	deprecated?: boolean | string;
	description?: string;
	examples?: string[];
	inherited?: boolean;
	meta: DocumentationClassMethodMeta;
	name: string;
	params?: DocumentationClassMethodParameter[];
	returns?: DocumentationReturns;
	returnsDescription?: string;
	scope?: string;
	see?: string[];
	throws?: string[];
}

export interface DocumentationClassEvent {
	access?: string;
	deprecated?: boolean | string;
	description: string;
	meta: DocumentationClassEventMeta;
	name: string;
	params: DocumentationClassEventParameter[];
	see?: string[];
}

export interface DocumentationClass {
	abstract?: boolean | undefined;
	access?: 'private' | undefined;
	construct?: DocumentationClassConstructor | undefined;
	deprecated?: boolean | undefined;
	description?: string | undefined;
	events?: DocumentationClassEvent[] | undefined;
	examples?: string[] | undefined;
	extendedDescription?: string | undefined;
	extends?: [string] | undefined;
	implements?: [string] | undefined;
	isExternal?: boolean | undefined;
	meta?: DocumentationClassMeta | undefined;
	methods?: DocumentationClassMethod[] | undefined;
	name: string;
	props?: DocumentationClassProperty[] | undefined;
	see?: string[] | undefined;
}

export interface DocumentationCustomFile {
	content: string;
	name: string;
	path: string;
	type: string;
}

export interface DocumentationCustom {
	[key: string]: {
		name: string;
		files: {
			[key: string]: DocumentationCustomFile;
		};
	};
}

export interface DocumentationExternal {
	meta: DocumentationExternalMeta;
	name: string;
	see: string[];
}

enum DocumentationLinkParams {
	class = 'class',
	typedef = 'typedef'
}

export interface DocumentationLink {
	[key: string]:
		| {
				name: string;
				params: {
					[key in DocumentationLinkParams]: string;
				};
		  }
		| string;
}

export interface DocumentationTypeDefinition {
	access?: 'private' | undefined;
	deprecated?: boolean | undefined;
	description?: string | undefined;
	extendedDescription?: string | undefined;
	isExternal?: boolean | undefined;
	meta?: DocumentationTypeDefinitionMeta | undefined;
	name: string;
	params?: DocumentationTypeDefinitionParameter[] | undefined;
	props?: DocumentationTypeDefinitionProperty[] | undefined;
	returns?: DocumentationReturns | undefined;
	returnsDescription?: string | undefined;
	see?: string[] | undefined;
	type?: string[][] | string[][][] | undefined;
	variant: 'type' | 'interface' | 'enum';
}

export interface DocumentationNamespace {
	deprecated?: boolean | undefined;
	description?: string | undefined;
	enumerations?: DocumentationTypeDefinition[] | undefined;
	extendedDescription?: string | undefined;
	interfaces?: DocumentationTypeDefinition[] | undefined;
	isExternal?: boolean | undefined;
	meta?: DocumentationTypeDefinitionMeta | undefined;
	name: string;
	see?: string[] | undefined;
	typeAliases?: DocumentationTypeDefinition[] | undefined;
}

export type DocIterateeUnion =
	| DocumentationClass
	// | DocumentationCustom
	| DocumentationExternal
	| DocumentationInterface
	// | DocumentationLink
	| DocumentationTypeDefinition
	| DocumentationClassEventParameter
	| DocumentationClassProperty
	| DocumentationClassMethod
	| DocumentationClassMethodParameter
	| DocumentationClassEvent;

export interface Documentation {
	classes: DocumentationClass[];
	custom: DocumentationCustom;
	// externals: DocumentationExternal[];
	// global?: string;
	// interfaces: DocumentationInterface[];
	// links: DocumentationLink[];
	meta: DocumentationMeta;
	namespaces: DocumentationNamespace[];
	//   id?: string;
	//   source?: string;
	//   tag?: string;
	typedefs: DocumentationTypeDefinition[];
}
