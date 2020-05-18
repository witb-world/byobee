const wordsFile = 'bee_list.txt';
const lettersFile = 'letters2.json';
var centerLetter = '';
var letterSet = new Set();
let wordsArray = [];
let guessedWords = [];
let maxPoints = 0;
let wordsList = [];
let thisDate = new Date();
thisDate.setHours(0, 0, 0, 0);
let dateKey = thisDate.toJSON();


function getWordsText() {
    return $.ajax({
        'url': wordsFile
    });
}

function getLetters() {
    return $.ajax({
        'url': lettersFile,
        'dataType': 'json'
    });
}

function handleWordsData(data) {
    wordsArray = data.split('\n');
    // console.log(wordsArray);
    wordsList = getWordList(wordsArray);
    maxPoints = getMaxPoints(wordsList);

    // displayCenterLetter();
    shuffleDisplay();
}

function handleLettersData(data) {
    let letterSets = data.letterSets;
    let i = 0;
    for (letterSet of letterSets) {
        if (letterSet.date.valueOf() == dateKey.valueOf()) {
            break;
        } else {
            i++;
        }
    }
    centerLetter = letterSets[i].magicLetter;
    letterSet = new Set(letterSets[i].letters);
}

function stripWhitespace(textStr) {

}

function parseGuess() {
    let valid = true;
    let thisGuess = getGuess().toLowerCase().replace(/\s/g, '');
    let msg = "";

    if (!validateforAlpha(thisGuess)) {
        valid = false;
        msg = "Alphabetical characters only please!"
    } else if (thisGuess.length < 4) {
        valid = false;
        msg = "Guess must be at least four letters";
    } else if (!lettersInSet(thisGuess)) {
        valid = false;
        msg = "You must use the letters in the set";
    } else if (!thisGuess.includes(centerLetter)) {
        valid = false;
        msg = "Your guess must include the center letter";
    } else if (guessedWords.includes(thisGuess)) {
        valid = false;
        msg = "You already guessed this word";
    } else if (!wordsList.includes(thisGuess)) {
        valid = false;
        msg = "this word is not in the set :(";
    }

    if (valid) {
        msg = isPangram(thisGuess) ? "Pangram! Way to go!" : "Good guess!";

        updatePoints(thisGuess);
        guessedWords.push(thisGuess);
        updateGuesses(thisGuess);
    }
    alert(msg);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]]
        // console.log(array);
    }
    return array;
}
function displayCenterLetter() {
    document.getElementById("centerLetter").innerHTML = centerLetter;
}

function shuffleDisplay() {
    document.getElementById("letterSet").innerHTML = "";
    letterArray = shuffle(Array.from(letterSet));
    for (let letter of letterArray) {
        if (letter === centerLetter) {
            document.getElementById("letterSet").innerHTML += `<font color="gold">${letter} </font>`;
        } else {
            document.getElementById("letterSet").innerHTML += letter + " ";
        }
    }
}

function updatePoints(guess) {
    let currentPoints = Number(document.getElementById("points").innerHTML);
    currentPoints += awardPoints(guess);
    let rank = "Let's play!";
    let rankVal = currentPoints / maxPoints;
    let genius = maxPoints;
    let ranks = [{ rank: "Genius!", points: Math.floor(maxPoints * 0.20) },
    { rank: "Amazing!", points: Math.floor(maxPoints * 0.10) },
    { rank: "Niiiiice", points: Math.floor(maxPoints * 0.05) },
    { rank: "Solid.", points: Math.floor(maxPoints * 0.025) },
    { rank: "Making progress!", points: Math.floor(maxPoints * 0.008) },
    { rank: "Moving up!", points: Math.floor(maxPoints * 0.004) },
    { rank: "Good start!", points: Math.floor(maxPoints * 0.002) }];
    let levelBarValue = currentPoints / ranks[0].points;
    console.log(Math.floor(levelBarValue * 100));
    let nextRank = ranks[6];
    let i = 0;
    for (ranking of ranks) {
        if (currentPoints >= ranking.points) {
            rank = ranking.rank;
            break;
        }
        i++;
        nextRank = ranks[i - 1];
    }

    document.getElementById("pbar").style.width = Math.floor(levelBarValue * 100) + "%";
    document.getElementById("nextRank").innerHTML = `${nextRank.points - currentPoints} points to level up!`
    document.getElementById("points").innerHTML = currentPoints;
    document.getElementById("level").innerHTML = rank;
}

function updateGuesses(guess) {
    document.getElementById("guesses").innerHTML = formatGuesses(guessedWords);
}

function formatGuesses(guessedWords) {
    let guessedWordsFormatted = '<ul class="list-inline">';
    for (word of guessedWords) {
        guessedWordsFormatted += `<li class="list-inline-item"><a href="https://www.dictionary.com/browse/${word}" target="_blank">${word}</a></li>`
    }
    guessedWordsFormatted += '</ul>';
    return guessedWordsFormatted;
}

function getGuess() {
    var thisGuess = document.getElementById("guessText").value;
    document.getElementById("guessText").value = "";
    return thisGuess;
}

function validateforAlpha(input) {
    let re = RegExp("^[a-zA-Z]+$");
    return re.test(input);
}

function checkForLettersInSet() {
    var text = lettersInSet(getGuess()) ? "Letters are in set" : "Letters not in set";
}

function awardPoints(winningWord) {
    let points = 0;
    if (winningWord.length < 5) {
        points = 1;
    } else {
        points = winningWord.length;
    }

    if (isPangram(winningWord)) {
        points += 7;
    }

    return points > 20 ? 20 : points;
}

function getMaxPoints(wordsList) {
    let maxScore = 0;
    for (word of wordsList) {
        console.log(word);
        maxScore += awardPoints(word);
    }
    return maxScore;
}

function getWordList(wordsArray) {
    return wordsArray.filter(word =>
        word.length > 3
        && word.includes(centerLetter)
        && lettersInSet(word)
    );
}

function lettersInSet(word) {
    for (letter of word.split('')) {
        if (!letterSet.has(letter)) return false;
    }
    return true;
}

function isPangram(word) {
    for (letter of letterSet) {
        if (!word.includes(letter)) return false;
    }
    return true;
}
