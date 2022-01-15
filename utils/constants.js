const appTemplateFileExclusions = [];

const appTypeMap = {
	'Micro-App': 'microApp'
};

const lmiAppSampleData = {
	name: 'lmi-app-creator-sample',
	version: '',
	type: '',
	optionalFeatures: [],
	description:
		'This file is needed for upgrades. Please do not delete this file.'
};

module.exports = {
	appTemplateFileExclusions,
	lmiAppSampleData,
	appTypeMap
};