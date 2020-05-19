/**
 * A less-than-pretty script to generate a year's worth of spelling bee games.
 */

let fs = require("fs");

let gameWords = new Set();
let wordSets = [];
let obj = {
    letterSets : []
};

function hasSevenLetters(word) {
    let letters = new Set();
    for (letter of word) {
        letters.add(letter);
    }
    return letters.size === 7;
}

function getDateFromInt(num, startDate) {
    startDate.setDate(startDate.getDate() + num);
    return startDate;
}

function randomInt(max) {
    let rand = -0.5 + Math.random() * (max + 1);
    return Math.round(rand);
}

let allWords = fs.readFileSync("public/bee_list.txt", "utf8").split("\n");

for (word of allWords) {
    if (hasSevenLetters(word)) {
        wordLetters = new Set();
        for (letter of word){
            wordLetters.add(letter);
        }
        gameWords.add(wordLetters);
    }
} 

for (word of gameWords) {
    let wordStr = Array.from(word).join('');
    for (letter of word){
        wordSets.push({magicLetter: letter, letters: wordStr})
    }
}

for (let i = 0; i < 365; i++){
    let index = randomInt(wordSets.length)
    let thisEntry = wordSets[index];
    wordSets.splice(index, 1);
    let thisDate = getDateFromInt(i, new Date("2020-05-16"));
    thisDate.setHours(0,0,0,0);
    thisEntry.date = thisDate.toJSON();
    obj.letterSets.push(thisEntry);
}

let json = JSON.stringify(obj);
fs.writeFileSync('letters2.json', json, 'utf8');