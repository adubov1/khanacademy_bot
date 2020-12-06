// ==UserScript==
// @name         Khan Academy Bot
// @version      0.1
// @description  ur welcome cheater
// @author       Alex Dubov (github@adubov1)
// @match        https://www.khanacademy.org/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    window.loaded = false

    const originalFetch = window.fetch;
    window.fetch = function () {
        return originalFetch.apply(this, arguments).then((res) => {
            if (res.url.includes("/getAssessmentItem")) {
                const clone = res.clone();
                clone.json().then(json => {
                    const item = json.data.assessmentItem.item.itemData;
                    const question = JSON.parse(item).question;

                    switch (Object.keys(question.widgets)[0].split(" ")[0]) {
                        case "numeric-input":
                            return correctFreeResponseAnswerFrom(question);
                        case "radio":
                            return correctMultipleChoiceAnswerFrom(question);
                        case "expression":
                            return correctExpressionAnswerFrom(question);
                        case "dropdown":
                            return correctDropdownAnswerFrom(question);
                    }
                });
            }
            if (!window.loaded) {
                console.clear();
                console.log("%cAnswer Revealer Loaded", "color: green; -webkit-text-stroke: 1px black; font-size:30px; font-weight:bolder;");
                console.log("%cCreated by Alex Dubov", "color: white; -webkit-text-stroke: 1px black; font-size:10px; font-weight:bold;");
                window.loaded = true;
            }

            return res;
        })
    }

    const logAnswer = (message) => {
        let style = "color: tomato; -webkit-text-stroke: 1px black; font-size:20px; font-weight:bold;";
        message.map(ans => {
            if (typeof ans == "string") {
                if (ans.includes("web+graphie")) {
                    const url = ans.replace("![](web+graphie", "https").replace(")", ".svg");
                    const image = new Image();

                    message[message.indexOf(ans)] = ""
                    image.onload = function () {
                        const imageStyle = [
                            'font-size: 1px;',
                            'line-height: ' + this.height % 2 + 'px;',
                            'padding: ' + this.height * .5 + 'px ' + this.width * .5 + 'px;',
                            'background-size: ' + this.width + 'px ' + this.height + 'px;',
                            'background: url(' + url + ');'
                        ].join(' ');
                        console.log('%c ', imageStyle);
                    };
                    image.src = url;
                } else {
                    message[message.indexOf(ans)] = ans.replaceAll("$", "")
                }
            }
        })
        const text = message.join("\n")
        if (text) console.log(`%c${text} `, style);
    }

    function correctMultipleChoiceAnswerFrom(question) {
        let answers = Object.values(question.widgets).map(function (widget) {
            if (!widget?.options?.choices) return;
            return widget.options.choices.map(choice => {
                if (choice.correct) {
                    return choice.content;
                }
            });
        }).flat().filter(function (val) { return val !== undefined; });
        logAnswer(answers);
    }

    function correctFreeResponseAnswerFrom(question) {
        let answers = Object.values(question.widgets).map(function (widget) {
            return widget.options.answers.map(answer => {
                return answer.value;
            });
        }).flat().filter(function (val) { return val !== undefined; });
        logAnswer(answers);
    }

    function correctExpressionAnswerFrom(question) {
        let answers = Object.values(question.widgets).map(function (widget) {
            return widget.options.answerForms.map(answer => {
                if (answer.status != 'correct') return;
                return answer.value;
            });
        }).flat().filter((obj) => obj);
        logAnswer(answers);
    }

    function correctDropdownAnswerFrom(question) {
        let answers = Object.values(question.widgets).map(function (widget) {
            return widget.options.choices.map(choice => {
                if (choice.correct) {
                    return choice.content;
                }
            });
        }).flat().filter((obj) => obj);
        logAnswer(answers);
    }
})();