import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type WxtViteConfig } from "wxt";

export default defineConfig({
	modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
	srcDir: "src",
	vite(_env) {
		return {
			plugins: [tailwindcss()],
		} as WxtViteConfig;
	},
	manifest: {
		permissions: ["storage", "tabs"],
		web_accessible_resources: [
			{
				resources: ["custom.html"],
				matches: ["*://*.sacmais.com.br/*"],
			},
		],
	},
	hooks: {
		"build:manifestGenerated": (_wxt, manifest) => {
			manifest.content_scripts ??= [];
			manifest.content_scripts.push({
				css: ["assets/reset.css"],
				matches: ["*://*.sacmais.com.br/*"],
			});
		},
	},
});
