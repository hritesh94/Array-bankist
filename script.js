'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-06-24T17:01:17.194Z',
    '2023-06-26T23:36:17.929Z',
    '2023-06-27T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2023-06-25T18:49:59.371Z',
    '2023-06-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = `${date.getFullYear()}`;
  // return `${day}/${month}/${year}`;
  //all above 👆 in one line using Intl namespace and account locale passed from display movements
  return new Intl.DateTimeFormat(locale).format(date);
};

//formatting the currencies
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency, //to get currency from account
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    //👇 loops for movements date
    const date = new Date(acc.movementsDates[i]);

    //note here was every code for formateMovementDate but we refactored it and made it a seperate function
    const displayDate = formatMovementDate(date, acc.locale);

    //refactoring this👇 to use it in multiple
    // const formattedMov = new Intl.NumberFormat(acc.locale, {
    //   style: 'currency',
    //   currency: acc.currency//to get currency from account
    // }).format(mov);

    const formattedMov = formatCur(mov, acc.locale, acc.currency); //we could have written it directly below👇 but i wanted to show the change
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
      </div>
    `;
    //<div class="movements__value">${mov.toFixed(2)}€</div> we used it before in place of formattedMov above👆
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  // labelBalance.textContent = `${acc.balance.toFixed(2)}€`;//format👇
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  // labelSumIn.textContent = `${incomes.toFixed(2)}€`;//format👇
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  // labelSumOut.textContent = `${Math.abs(out.toFixed(2))}€`;//format👇
  labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  // labelSumInterest.textContent = `${interest.toFixed(2)}€`;//format👇
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};
//log out function
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0); //the we will get a decimal part like something 1.443 and the no before the decimal part is mins
    const sec = String(time % 60).padStart(2, 0); // the remainder is the seconds
    //In each call ,print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //When 0 seconds,stop timer and log out user
    if (time === 0) {
      //to cancel the setinterval👇
      clearInterval(timer);

      //log out the user but here basically we are setting the opacity to 0 and changing the welcome text to normal logIn text👇
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log In to Get Started`;
    }

    //decrease 1s👇
    time--;
  };

  //DONT panic seeing this long code below👇 its just was commented intentionnal

  //SO HERE we are calling the function inside the setInterval but the problem was that the function declared inside the setInterval gets called after 1 second
  // and not immediately but we want to call it immediately so we will export this whole function into a seperate block and then call it👇

  // //Set time to 5 minutes
  let time = 120; //yeah you can access the variable before
  // //call the timer every seconds

  tick(); //calling it immediately so that there is no 1 sec delay
  timer = setInterval(
    //we have declared the timer below <-- we can access the variable before the declaration
    //   function () {
    //   const min = String(Math.trunc(time / 60)).padStart(2,0);//the we will get a decimal part like something 1.443 and the no before the decimal part is mins
    //   const sec = String(time % 60).padStart(2,0);// the remainder is the seconds
    //   //In each call ,print the remaining time to UI
    //   labelTimer.textContent = `${min}:${sec}`;

    //   //decrease 1s👇
    //   time--;
    //     //When 0 seconds,stop timer and log out user
    //   if (time === 0) {
    //     //to cancel the setinterval👇
    //     clearInterval(timer)

    //     //log out the user but here basically we are setting the opacity to 0 and changing the welcome text to normal logIn text👇
    //     containerApp.style.opacity = 0;
    //     labelWelcome.textContent = `Log In to Get Started`;

    //   }

    //   }
    tick,
    1000
  );
  //the reason we are returing the timer here 👇 is becoz if there are two users logged in then there are two timers alternating with each other so to stop that we need to delete a timer if there is already a timer running so thats why we are returning
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;
//we need the "timer" to be global becoz of we need this variable to persist b/w different logins

//Expermenting with API (to later add international dates)
//we can also format lists with intl see more in mdn
const now1 = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'numeric', //we can write long instead of numeric which will show month name ,and 2-digit which will show like month in 2 digit
  year: 'numeric',
  weekday: 'long', //can  also be written short or narrow
};
labelDate.textContent = new Intl.DateTimeFormat('en-US').format(now1);

//also instead of mentioning localilty or country manually like en-US ,we can also get it 👇 from the browser
const locale = navigator.language;
console.log(locale);

console.log(new Intl.DateTimeFormat(locale, options).format(now1));
//this 👆 here is the code for international API date and also Intl.DateTimeFormat('language-country',object to show hours,mins,day in which format).format(what you want to format(i.e date,number) here is now1)

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //current date
    //previos manual code👇
    // const now1 = new Date();
    // const day = `${now1.getDate()}`.padStart(2, 0);
    // const month = `${now1.getMonth() + 1}`.padStart(2, 0);
    // const year = `${now1.getFullYear()}`;
    // const hour = `${now1.getHours()}`.padStart(2, 0);
    // const min = `${now1.getMinutes()}`.padStart(2, 0);

    //api which handles everything 👇
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', //we can write long instead of numeric which will show month name ,and 2-digit which will show like month in 2 digit
      year: 'numeric',
      // weekday: 'long', //can  also be written short or narrow
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now1);

    // labelDate.textContent = `${day}/${month}/${year},${hour}:${min}`;
    // labelDate.textContent = new Intl.DateTimeFormat('ar-SY').format(now1);
    //format in day/month/year

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //if timer present clear it
    if (timer) clearInterval(timer);

    //after logging in timer starts👇
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add the transfer date when the transfer is created
    currentAccount.movementsDates.push(new Date().toISOString()); //toisostring is used becoz the new created date was an object
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    //Reset timer if there is no inactivity (or if there is a transfer of loan or amount so this why we are including it in button transfer )
    clearInterval(timer);
    //then start a new timer 👇
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //Add the loan transfer date when the transfer is created
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
console.log(23 === 23.0);
//this 👇 will show false but as we all know this is true ,so this is the analomous behavior of the js and we have to keep in mind this analomy
console.log(0.1 + 0.2 === 0.3);

//we can also convert string to a number by writing + and js will do type coercion
//hard way👇
console.log(Number('23'));
//easier way👇
console.log(+'23');

//Parsing
//to make this work the string has to start with number then it returns number as o/p
console.log(Number.parseInt('30px', 10));
//here 👇 it wont work as it starts with e
console.log(Number.parseInt('e23', 10));
//the number 10 after , specifies the base i.e decimal or binary
//parseFloat also gives the decimal part👇
console.log(Number.parseFloat('2.5rem'));
//it 👇 will not give the .5 part
console.log(Number.parseInt('2.5rem'));
//as parsefloat,parseint has become global so we can just write them instead of Number.parseInt etc and they would also work
console.log(parseFloat('2.4rem'));

//isNaN checks if its not a number ==>here it will show the string '20' as number and also it shows infinite as a number so it will false in all these cases
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'29x'));
console.log(Number.isNaN(23 / 0));

//but the isFinite always shows true if the i/p is number but not a string ,not infinite
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'29x'));
console.log(Number.isFinite(23 / 0));

//if number is integer
console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));

//===============================================Math========================================================
//to find square root
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

// to find max number among different no
console.log(Math.max(5, 18, 23, 11, 2));
//it also does type coercion
console.log(Math.max(5, 18, '23', 11, 2));
//but it does not parse
console.log(Math.max(5, 18, '23px', 11, 2));

//to find min of no
console.log(Math.min(5, 18, 23, 11, 2));

//we can find the area of circle also by using Math.pi
console.log(Math.PI * Number.parseFloat('10px') ** 2);

//random no using random()
console.log(Math.trunc(Math.random() * 6) + 1);
//to generate a random no b/w 1 to 6 ,
//but we can generalise this👇
const randomInt = (min, max) => Math.trunc(Math.random() * (max - min) + 1);
// 0...1 -> 0...(max-min) ->(min......max)
console.log(randomInt(10, 20));

//Rounding Integers
//.trunc() removes any decimal part
console.log(Math.trunc(23.3));

//.round() -->always round to the nearest integer
console.log(Math.round(23.3));
console.log(Math.round(23.5));
console.log(Math.round(23.9));

//.ceil () always rounds up i.e it rounds to higher i.e if 23.1 ==> then it becom =>24
console.log(Math.ceil(23.5));
console.log(Math.ceil(23.9));

//.floor () always rounds down i.e it round to lower i.e if 23.4 or 23.9 ===> then it becom =>23
console.log(Math.floor(23.9));
console.log(Math.floor(23.5));
//these methods also do type coercion
console.log(Math.floor('23.5'));
//floor and trunc works the same way for positive number

//but in -ve both trunc and floor works differently
console.log(Math.trunc(-23.3));
console.log(Math.floor(-23.3));

//Rounding decimals ==>it is similar to keeping or rounding up to how many decimal points you want
//but it returns string not a number
console.log((2.4).toFixed(0));
console.log((2.4).toFixed(3));
console.log((2.345).toFixed(3));
//here 👇 you may expect something diff but we get diff result and it is becoz of js
console.log((2.345).toFixed(2));

//for logarithmic and sinus function -> go to mdn docs

//===============REMAINDER opertor===================================
console.log(5 % 2);

const isEven = n => n % 2 === 0;
console.log(isEven(23));
console.log(isEven(24));

//===================NUMBERIC SEPERATOR===========================
//like in english or in indian method we use ',' to seperate the zeroes 0
//here in js we use '_' to seperate zeroes
// also it cannot be used in string form of numbers i.e ('234_9000') like this
const diameter = 234_0000;
//in console.log we can see the js basically ignores the "_"
console.log(diameter);

const priceCents = 234_99;
console.log(priceCents);

//illegal places
//PI = _3.14
//PI = 3._14
//PI = 3.14_
//also cannot place __(two numeric seperators in a row)

const PI = 3.1415;

//also does not work in string
console.log(Number('230_000'));

//IN API we should not use _

//also in parseInt->we will get before the underscore
console.log(parseInt('230_000'));

///=====================================BIGINT==========================================================================
/*Let's now meet one of the primitive data types,
that we never talked about before
and that is BigInt.
So big and is a special type of integers
that was introduced in year 2020
and so let's quickly take a look at it.
So we learned in the first lecture of the section
that numbers are represented internally as 64 bits.
And that means that there are exactly 64 ones or zeros
to represent any given number.
Now of these 64 bits only 53 are used
to actually store the digits themselves.
The rest are for storing the position
of the decimal point and the sign.
Now, if there are only 53 bits to store the number,
that means that there is a limit
of how big numbers can be,
and we can calculate that number.
So that's two elevated to 53
and then minus one, because the numbers starts at zero. */

console.log(2 ** 53 - 1);
//👆 this number is so important that
//it's even stored into the number 👇namespace as MAX_SAFE_INTEGER
console.log(Number.MAX_SAFE_INTEGER);
//👆 So any integer that is larger than this, is not safe and that means it cannot be represented accurately.

/*So, this can be a problem sometimes
because in some situations
we might need really, really big numbers.
Way bigger than this one here,
for example, for database IDs
or when interacting with real 60 bit numbers
and these numbers are actually used in other languages.
And so we might, for example
from some API, get a number that is larger than this.
And then we have no way
of storing that in JavaScript,
at least not until now,
because now starting from IES 2020
a new primitive was added,
which is called BigInt.
Now right? And BigInt stands for big integer.
And it can be used to store numbers as large as we want.
So no matter how big, all right. */

console.log(3459387429887923747328498234n);
//see how we are just including 'n' at the last to indicate its a BIGINT👆
//👇 we can also use BigInt()
console.log(BigInt(3459387429887923747328498234));
//but notice 👆 in js engine console log the same no which was copied from 'n' above doesnt show the same no given
//its becoz the js does some internal work and then it represents as bigInt exteranlly
//so its advice to use 'n' to show these large no
// so we  use small nos using bigInt like 5-6digit nos
console.log(BigInt(23423454));

//Operations
console.log(10000n + 10000n);
console.log(302487236482736482734872928374n * 100000n);
//but mixing bigInt with regular nos is not possible
const huge = 982367479823648273n;
const num = 23;
// console.log(huge * num);
//👆 it will show error
// so this is where the constructor function BigInt comes into play👇
console.log(huge * BigInt(num));
// console.log(Math.sqrt(16n));
//👆 cannot do sqrt of n

//Exceptions
console.log(223987749827634987263478960n > 15);
//👆 here "n" can be used for nos comparision
console.log(20n === 20);
//👆 false as === doesnt do type coercion so yeah 20n is bigInt so false

console.log(typeof 20n);
console.log(20n == '20');
//👆 does type coercion

//string concatenation
console.log(huge + 'is really big');

//Divisions
console.log(10n / 3n);
//👆 it will not show the decimal part while division

//==========================DATES AND TIMES======================================================
//create a date
const now = new Date();
console.log(now);
console.log(new Date('Wed Jun 28 2023 11:22:19 GMT+0530'));
//but passing in dates like in this 👇 string is quite unreliable
console.log(new Date('December 25 ,2022'));
console.log(new Date(account1.movementsDates[0]));

//new Date(year,month(0-11 as js considers from 0 so jan is 0),day,hours in 24 hour format,minutes,seconds)👇
console.log(new Date(2037, 10, 19, 14, 23, 4));
//also it can 👇 autocorrect wrong date input like 31st novembor doesnt exist so it will make it 1st december
console.log(new Date(2045, 10, 31, 23, 43, 5));

//0 milliseconds after initial unix time👇
console.log(new Date(0)); //<- 0th date or initial or starting date
//3 days after initial date => 3 *24(hours)*60(mins)*60(secs)*1000(milliseconds)
console.log(new Date(3 * 24 * 60 * 60 * 1000));
3 * 24 * 60 * 60 * 1000; //<- this is the times stamp of day three ===

//working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
//👇 always use getFullyear dont use getYear()
console.log(future.getFullYear());
console.log(future.getMonth()); //0 zero based as jan is considered 0
console.log(future.getDate());
console.log(future.getDay()); //0 zero based so sunday is considered 0
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
//👆 it returns the string of dates like in the account1.movementDates
console.log(future.getTime());
//it 👆 gives timestamps like in the time after unix time

//time stamp for now👇
console.log(Date.now());
//👇 we can set the year
future.setFullYear(2040);

//===================================OPERATION WITH DATES=====================================================
//doing calculations with date

const Future = new Date(2037, 10, 19, 15, 23);
console.log(+Future);

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));
/*Now,if you need really precise calculations,  for example, including time changes due  to daylight saving changes,  and other weird edge cases like that,  then you should use a date library like moment dot js.  And that's a library  that's available for free for all JavaScript developers. */

const options1 = {
  style: 'currency', //we can write here -> temp,percentage,currency,unit
  //when we set currency ,percentage then unit is completely ignored
  unit: 'mile-per-hour',
  //but we need to define currency👇
  currency: 'EUR', //we have to define the currency manually
  // useGrouping:false //it will print the nos without the seperators
};

const Num = 3884764.23;
console.log('US:', new Intl.NumberFormat('en-US', options1).format(Num));
console.log('Germany:', new Intl.NumberFormat('de-DE', options1).format(Num));
console.log('Syria:', new Intl.NumberFormat('ar-SY', options1).format(Num));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options1).format(Num)
);

//=======================timeout and setInterval===========================================================
//setTimeout => calls the callback function only once
setTimeout(() => console.log('Here is your pizza'), 3000);
console.log('Waiting---');
/*So again, as soon as JavaScript hits this line of code here,
it will simply basically keep counting the time
in the background, and register this callback function
to be called after that time has elapsed,
and then immediately, JavaScript will move on
to the next line, which is this one, all right.
And this mechanism is called Asynchronous JavaScript */

//we can declare parameters in the setTimeout👇
// setTimeout((params) => console.log('Here is your pizza'),3000,...arguments to pass in  the params);
setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza2 with ${ing1},${ing2}`),
  3000,
  'olives',
  'spinach'
);

const ingredients = ['olives', 'spinach'];
const pizzatimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza3 with ${ing1},${ing2}`),
  3000,
  ...ingredients
);
// we can also cancel the timeout using the clearTimeOut(pass in the name of the timer)👇
// if (ingredients.includes('spinach')) clearTimeout(pizzatimer);
//quokka js 👆 is showing some problem here

//setTimeInterval -->works every Interval
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 3000);
