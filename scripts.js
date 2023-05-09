//retrieves to HTML elements on the page for use in JS
let basecurrency = document.getElementById("base-currency");
let targetCurrency = document.getElementById("target-currency");
let amountInput = document.getElementById("amount");
let convertedAmount = document.getElementById("converted-amount");
let historicalRates = document.getElementById("historical-rates");
let historicalRatesContainer = document.getElementById("historical-rates-container");
let saveFavorite = document.getElementById("save-favorite");
let favoriteCurrencyPairs = document.getElementById("favorite-currency-pairs");
let historicalDate = document.getElementById("historical-date");
let historicalRatesFirst = document.getElementById("view-historical-rate");

//API request set up
const myHeaders = new Headers();
myHeaders.append("apikey", "IllZF8hPZMCW52PWU4al5SYN4yEmT3tE"); 

const requestOptions = {
  method: "GET",
  redirect: "follow",
  headers: myHeaders,
};

//fetch the currencies and populate the dropdown menus
function fetchAvailableCurrencies() {
  fetch("https://api.apilayer.com/exchangerates_data/symbols", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      getCurrencyDropdowns(result.symbols);
    })
    .catch((error) => console.log("error", error)); //throws an error if the currency can't be retrieved(in theory)
}

function getCurrencyDropdowns(symbols) {//symbols is the argument, currencyCode as keys, currency names are values
  for (const currencyCode in symbols) {  //
    const option = document.createElement("option"); //creates new option html element used to select a currency
    option.value = currencyCode;  //sets the value attribute of the option element to currencyCode
    option.text = `${currencyCode} - ${symbols[currencyCode]}`; //combines the currencyCode and name to a string

    basecurrency.add(option.cloneNode(true)); //copies the option element, then adds to basecurrency
    targetCurrency.add(option); //adds original element of option to targetCurrency
  }
}

// Convert the currency based on the user's inputs using API
function convertCurrency() {
  const from = basecurrency.value;  //gets value of user selected base currency
  const to = targetCurrency.value;  //gets value of user selected target currency
  const amount = amountInput.value; //gets amount value to convert from the user

  const url = `https://api.apilayer.com/exchangerates_data/convert?from=${from}&to=${to}&amount=${amount}`; 

  fetch(url, requestOptions) //sends fetch request for API endpoint data
    .then((response) => response.json()) //converts the API responds to JSON
    .then((result) => { //creates promise to convert result
      if (result.success) { //if the conversion is successful..
        convertedAmount.textContent = result.result.toFixed(2);//set the text content to the result using toFixed()to make a string
      } else {
        console.error("Conversion error", result.error); //error handling
      }
    })
    .catch((error) => console.log('error', error)); //error handling
}

// Fetch historical exchange rates for the specified dates and currencies
function fetchHistoricalRates() {
    const from = basecurrency.value;
    const to = targetCurrency.value;
  
    const url = `https://api.apilayer.com/exchangerates_data/${historicalDate.value}?symbols=${to}&base=${from}`;
  
    fetch(url, requestOptions)
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          historicalRatesFirst.textContent = `1 ${from} = ${result.rates[to]} ${to}`;
        } else {
          console.error('Historical rate error', result.error);
        }
      })
      .catch(error => console.log('error', error));
}

// Save the user's favorite currency pair to local storage and display a button for it
let favorites = [];

function getFavoriteCurrencyPair() {
  const from = basecurrency.value; //part 1 of selected favorite pair
  const to = targetCurrency.value; //part 2 of selected favorite pair
  const favorite = `${from}_${to}`; //string of pair
  let favorites = JSON.parse(localStorage.getItem("favorites")) || []; //get old pairs from local storage

//if the pair isn't already in favorites...
  if (!favorites.includes(favorite)) {  
    favorites.push(favorite);
    localStorage.setItem("favorites", JSON.stringify(favorites)); //add to local storage

    const button = document.createElement("button"); //button to respresent fav pair
    button.textContent = `${from} to ${to}`; //text content of button to display
    button.dataset.from = from; //makes data attribute for button and sets the value of the from
    button.dataset.to = to; //makes a to value dataset

    button.addEventListener("click", () => {//when clicked sets base and target currencies
      basecurrency.value = button.dataset.from;
      targetCurrency.value = button.dataset.to;
      convertCurrency();
    });

    favoriteCurrencyPairs.appendChild(button); //adds button to list of pairs 
  }
}

////////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
  fetchAvailableCurrencies();
});
saveFavorite.addEventListener("click", getFavoriteCurrencyPair);
amount.addEventListener("input", convertCurrency);
basecurrency.addEventListener("change", convertCurrency);
targetCurrency.addEventListener("change", convertCurrency);
historicalRates.addEventListener("click", fetchHistoricalRates);