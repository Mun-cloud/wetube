//구식 javascript 언어만 이해함
// 두 가지 유의사항
// src 아래에 client 등 폴더를 따로 만들어 웹팩에 보낼 파일들을 그 곳에 생성한다.(entry(소스코드)가 필요하다.)
//dirname은 자바스크립트에서 제공하는 상수로서 파일까지의 전체경로를 말한다.
//path를 선언하고 path.resolve()를 하면 ()안에 들어가있는 경로들을 이어준다.
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path")

const BASE_JS = "./src/client/js/"

module.exports = {
    entry: {
        main: `${BASE_JS}main.js`,
        videoPlayer: `${BASE_JS}videoPlayer.js`,
        recorder: `${BASE_JS}recorder.js`,
        commentSection: `${BASE_JS}commentSection.js`,
    },
    plugins: [new MiniCssExtractPlugin({
        filename: "css/styles.css"
    })],
    output: {
        filename: "js/[name].js",
        path: path.resolve(__dirname, "assets"),        //정대경로여야 함. 그렇지 않으면 "absolute path!" 의 오류 발생
        clean: true,    //서버 재시작 시 과거 파일,폴더를 지워줌
    },
    module: {       //자바스크립트 코드를 babel-loader라는 loader로 가공하는 것
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [["@babel/preset-env", {targets: "defaults"}]],
                    },
                },
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]     //[]로 여러 loader들을 묶을 수 있음. 실행의 역순으로 작성해야 함.
            }
        ],
    }
}