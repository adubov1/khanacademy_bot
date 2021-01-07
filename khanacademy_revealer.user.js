// ==UserScript==
// @name         Khan Academy Bot
// @version      1.4
// @description  ur welcome cheater
// @author       Alex Dubov (github@adubov1)
// @match        https://www.khanacademy.org/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    window.loaded = false;

    class Answer {
        constructor(answer, type) {
            this.body = answer;
            this.type = type;
        }

        get isMultiChoice() {
            return this.type == "multiple_choice";
        }

        get isFreeResponse() {
            return this.type == "free_response";
        }

        get isExpression() {
            return this.type == "expression";
        }

        get isDropdown() {
            return this.type == "dropdown";
        }

        log() {
            const answer = this.body;
            const style = "color: coral; -webkit-text-stroke: .5px black; font-size:24px; font-weight:bold;";

            answer.map(ans => {
                if (typeof ans == "string") {
                    if (ans.includes("web+graphie")) {
                        this.body[this.body.indexOf(ans)] = "";
                        this.printImage(ans);
                    } else {
                        answer[answer.indexOf(ans)] = ans.replaceAll("$", "");
                    }
                }
            });

            const text = answer.join("\n");
            if (text) {
                console.log(`%c${text.trim()} `, style);
            }
        }

        printImage(ans) {
            const url = ans.replace("![](web+graphie", "https").replace(")", ".svg");
            const image = new Image();

            image.src = url;
            image.onload = () => {
                const imageStyle = [
                    'font-size: 1px;',
                    'line-height: ', this.height % 2, 'px;',
                    'padding: ', this.height * .5, 'px ', this.width * .5, 'px;',
                    'background-size: ', this.width, 'px ', this.height, 'px;',
                    'background: url(', url, ');'
                ].join(' ');
                console.log('%c ', imageStyle);
            };
        }
    }

    const originalFetch = window.fetch;
    window.fetch = function () {
        return originalFetch.apply(this, arguments).then((res) => {
            if (res.url.includes("/getAssessmentItem")) {
                const clone = res.clone();
                clone.json().then(json => {
                    let item, question;

                    try {
                        item = json.data.assessmentItem.item.itemData;
                        question = JSON.parse(item).question;
                    } catch {
                        let errorIteration = () => { return localStorage.getItem("error_iter") || 0; }
                        localStorage.setItem("error_iter", errorIteration() + 1);

                        if (errorIteration() < 4) {
                            return location.reload();
                        } else {
                            return console.log("%c An error occurred", "color: red; font-weight: bolder; font-size: 20px;");
                        }
                    }

                    if (!question) return;

                    Object.keys(question.widgets).map(widgetName => {
                        switch (widgetName.split(" ")[0]) {
                            case "numeric-input":
                                return freeResponseAnswerFrom(question).log();
                            case "radio":
                                return multipleChoiceAnswerFrom(question).log();
                            case "expression":
                                return expressionAnswerFrom(question).log();
                            case "dropdown":
                                return dropdownAnswerFrom(question).log();
                        }
                    });
                });
            }

            if (!window.loaded) {
                console.clear();
                console.log("%c Answer Revealer ", "color: mediumvioletred; -webkit-text-stroke: .5px black; font-size:40px; font-weight:bolder; padding: .2rem;");
                console.log("%cCreated by Alex Dubov (@adubov1)", "color: white; -webkit-text-stroke: .5px black; font-size:15px; font-weight:bold;");
                window.loaded = true;
            }

            return res;
        })
    }

    function freeResponseAnswerFrom(question) {
        const answer = Object.values(question.widgets).map((widget) => {
            if (widget.options?.answers) {
                return widget.options.answers.map(answer => {
                    if (answer.status == "correct") {
                        return answer.value;
                    }
                });
            }
        }).flat().filter((val) => { return val !== undefined; });

        return new Answer(answer, "free_response");
    }

    function multipleChoiceAnswerFrom(question) {
        const answer = Object.values(question.widgets).map((widget) => {
            if (widget.options?.choices) {
                return widget.options.choices.map(choice => {
                    if (choice.correct) {
                        return choice.content;
                    }
                });
            }
        }).flat().filter((val) => { return val !== undefined; });

        return new Answer(answer, "multiple_choice");
    }

    function expressionAnswerFrom(question) {
        const answer = Object.values(question.widgets).map((widget) => {
            if (widget.options?.answerForms) {
                return widget.options.answerForms.map(answer => {
                    if (Object.values(answer).includes("correct")) {
                        return answer.value;
                    }
                });
            }
        }).flat();

        return new Answer(answer, "expression");
    }

    function dropdownAnswerFrom(question) {
        const answer = Object.values(question.widgets).map((widget) => {
            if (widget.options?.choices) {
                return widget.options.choices.map(choice => {
                    if (choice.correct) {
                        return choice.content;
                    }
                });
            }
        }).flat();

        return new Answer(answer, "dropdown");
    }
})();