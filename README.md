# An answer revealer for Khan Academy

  *Working as of 12/5/2020* 

If this script helped or interested you, please consider staring the repo above. That number looks cool when it's big


## Usage
1. Download a userscript manager like [TamperMonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) or [Greasemonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/).
2. Use [this link](https://greasyfork.org/scripts/418155-khan-academy-bot/code/Khan%20Academy%20Bot.user.js) to install the script. 
3. Open Developer Tools and go to the Console tab. The script will console log answers as the browser gets them.

## Gotchas
- Khan Academy always requests the current and next question, so **expect the second to last console log message to be the correct answer**
- This works only for expression, free response, multiple choice, and dropdown questions.
- When there are multiple answers, fill in the boxes left-to-right and then down. You can also press tab to get to the next field. Example below
  - answer: `[1, 2, 3, 4]`  question: <img src="readme/multiple_free_response.png" width="250">
- The script will do its best to find the answer in the question data (read below to understand the exploit)
- I am lazy, therefore this is buggy. Don't be surprised when you run into a question you'll actually have to do

## Exploit
It's pretty simple. On every 'quiz' you open in the app, your browser makes a request to `/getAssessmentItem`. The server responds with everything your client needs to draw **and grade** your question. Within this graphql response is a json blob containing a list of questions, most of them with a `correct: boolean` attribute.

## Implementation
I wrote this for Chrome, although all should work on gecko. It essentially hooks into the browser's `fetch`, which is what Khan Academy uses now instead of `XMLHttpRequest` (this is why the some old exploits no longer work, along with the endpoint change), and when `/getAssessmentItem` is requested, it logs the "important" part of the response.

## Licence
This has the GNU GPL 3.0 licence. I expect most users will be people like me who have AP Stats assignments and no will to do them.  I don't care too much about what you do with it, but I like credit :)

<br><br>
P.S.
If you want to take a crack at making a front-end to this script, please let me know! I'd love to add your front end and credit you accordingly!
