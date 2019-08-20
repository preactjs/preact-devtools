const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: {
		app: "./src/index.ts",
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js", ".json"],
	},
	devtool: "#source-map",
	watch: true,
	module: {
		rules: [
			{
				test: /\.css/,
				use: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							modules: {
								localIdentName: "[name]__[local]--[hash:base64:2]",
							},
						},
					},
				],
			},
			{
				test: /\.tsx?/,
				use: ["ts-loader"],
			},
		],
	},
	devServer: {
		hot: true,
	},
	plugins: [new HtmlWebpackPlugin()],
};
