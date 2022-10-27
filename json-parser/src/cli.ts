#!/usr/bin/env node

import { docusaurusTypeDocJsonParser } from './parser';
import { config } from 'dotenv';

config();

await docusaurusTypeDocJsonParser({
	githubContentUrl: `https://api.github.com/repos/sapphiredev/docs/contents/docs`,
	githubToken: process.env.GITHUB_TOKEN
});
