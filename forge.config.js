const fs = require('fs')
const path = require('path')

module.exports = {
	packagerConfig: {
		asar: true,
	},
	rebuildConfig: {},
	makers: [
		{
			name: "@electron-forge/maker-squirrel",
			config: {},
		},
		{
			name: "@electron-forge/maker-zip",
			platforms: ["darwin"],
		},
		{
			name: "@electron-forge/maker-deb",
			config: {
				options: {
					icon: 'stopify.png'
				}
			},
		},
		{
			name: "@electron-forge/maker-rpm",
			config: {},
		},
	],
	plugins: [
		{
			name: "@electron-forge/plugin-auto-unpack-natives",
			config: {},
		},
	],
	publishers: [
		{
			name: "@electron-forge/publisher-github",
			config: {
				repository: {
					owner: "SilentJungle399",
					name: "stopify-desktop-app",
				},
				prerelease: true,
			},
		},
	],
	hooks: {
		packageAfterPrune: async (forgeConfig, buildPath, electronVersion, platform, arch) => {
			if (platform === 'linux') {
				console.log("We need to remove the problematic link file on Linux")
				console.log(`Build path ${buildPath}`)
				fs.unlinkSync(path.join(buildPath, 'node_modules/register-scheme/build/node_gyp_bins/python3'))
			}
		}
	}
};
