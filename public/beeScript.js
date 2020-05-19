const wordsFile = 'bee_list.txt';
const lettersFile = 'letters2.json';

let centerLetter = '';
let letterSet = new Set();
let wordsArray = [];
let guessedWords = [];
let maxPoints = 0;
let wordsList = [];

let thisDate = new Date();
thisDate.setHours(0, 0, 0, 0);

let dateKey = thisDate.toJSON();

/**************
 * AJAX: pulling data from text and JSON files in server
 **************/

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
    // handles data in text file containing all possible words,
    // updates variables containing array of words for this game and total points
    wordsArray = data.split('\n');
    wordsList = getWordList(wordsArray);
    maxPoints = getMaxPoints(wordsList);
    shuffleDisplay();
}

function handleLettersData(data) {
    // handles JSON data in letter sets
    // finds matching date out of letter sets, populates Set of letter
    // and "center letter" of puzzle.
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

/**************
 * DOM: Interacting with HTML elements
 **************/

 /**
  * Retrieving and processing data.
  */
function parseGuess() {
    // called in HTML form to validate and process each word guessed in game
    // sends alert() to page determining if guess was successful or not.
    let valid = true;
    let thisGuess = getGuess().toLowerCase().replace(/\s/g, ''); // accepting spaces in guess.
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

function getGuess() {
    // retrieves word entered in HTML guess form.
    // returns that word as a js string variable.
    let thisGuess = document.getElementById("guessText").value;
    document.getElementById("guessText").value = "";
    return thisGuess;
}

/**
 * Updating and formatting data.
 */

function shuffleDisplay() {
    // shuffles contents of letterSet, updates display and highlights "center letter".
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
    // updates points display elements in HTML, including points counter and progress bar.
    // also updates display of points needed to reach next ranking.
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
        { rank: "Good start!", points: Math.floor(maxPoints * 0.002) }
    ];
    let levelBarValue = currentPoints / ranks[0].points;
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
    // updates value of "guesses" element in HTML.
    document.getElementById("guesses").innerHTML = formatGuesses(guessedWords);
}

function formatGuesses(guessedWords) {
    // accepts a list of words
    // returns list formatted for HTML unordered list
    let guessedWordsFormatted = '<p>Click on a word to look up what it means.<p><ul class="list-inline">';
    for (word of guessedWords) {
        guessedWordsFormatted += `<li class="list-inline-item"><a href="https://www.dictionary.com/browse/${word}" target="_blank">${word}</a></li>`
    }
    guessedWordsFormatted += '</ul>';
    return guessedWordsFormatted;
}

/**************
 * Helper functions
 **************/

function validateforAlpha(input) {
    // compares input to regex, checking if only alphabetical characters used.
    let re = RegExp("^[a-zA-Z]+$");
    return re.test(input);
}

function shuffle(array) {
    // accepts an array, 
    // returns an array with the same elements shuffled.
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array;
}

function awardPoints(winningWord) {
    // accepts a word
    // returns its point value.
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
    // accepts an array of strings
    // returns sum of points for each word.
    let maxScore = 0;
    for (word of wordsList) {
        maxScore += awardPoints(word);
    }
    return maxScore;
}

function getWordList(wordsArray) {
    // accepts an array of words
    // returns an array of words with at least four characters,
    // having the center letter and composed of letters in the letter set.
    return wordsArray.filter(word =>
        word.length > 3
        && word.includes(centerLetter)
        && lettersInSet(word)
    );
}

function lettersInSet(word) {
    // checks if a word is composed only of letters in set.
    for (letter of word.split('')) {
        if (!letterSet.has(letter)) return false;
    }
    return true;
}

function isPangram(word) {
    // checks if word features all letters in a set.
    for (letter of letterSet) {
        if (!word.includes(letter)) return false;
    }
    return true;
}
