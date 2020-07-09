// choices = ["red", "green", "blue", "yellow"];
// onSystemOutput -> choice, position, length, done
// onUserInput -> valid, received, actual, position, length
function cymon(choices, onSystemOuptut, onUserInput, onGameOver) {

   // Arguments validation before proceeding
   // ======================================
   if (Array.isArray(choices) == false || choices.length < 2) {
      return;
   }

   if (typeof onSystemOuptut != 'function' || typeof onUserInput != 'function' || typeof onGameOver != 'function') {
      return;
   }
   // ======================================

   // number of milliseconds to wait while sending output 
   // of each blip in entire series
   const OUTPUT_DELAY = 700;
   // number of milliseconds to wait for input from user 
   // between each blip before timing out to lose the game
   const INPUT_TIMEOUT = 5000;

   var mode = 'off'; // off || out || in
   var series = [];
   var seriesIndex = 0;
   var userInputTimer;

   function gameOver(reason) {
      mode = 'off';
      series = undefined;
      stopUserInputTimer();
      onGameOver(reason);
   }

   function resetUserInputTimer(after) {
      if (mode != 'off') {
         stopUserInputTimer();
         userInputTimer = setTimeout(gameOver, INPUT_TIMEOUT, 'TIMED_OUT');
      }
   }

   function stopUserInputTimer() {
      clearTimeout(userInputTimer);
   }

   function getRandomChoice() {
      let randomIndex = Math.random() * choices.length;
      randomIndex = Math.floor(randomIndex);

      return choices[randomIndex];
   }

   function sendSystemOutput(choice, position, seriesLength, done) {
      if (mode != 'off') {
         onSystemOuptut(choice, position, seriesLength, done);
      }
   }

   function sendBlips() {
      var done = false;
      var delay = seriesIndex * OUTPUT_DELAY;
      var choice = series[seriesIndex];
      var position = seriesIndex + 1;
      var seriesLength = series.length + 1;

      if (mode != 'out') {
         return;
      }

      // When you run out of choices in series array,
      // push one additional choice at the end of the array before 
      // terminating the loop
      if (typeof choice == 'undefined') {
         choice = getRandomChoice();
         series.push(choice);
         done = true;
      }

      // callback 
      setTimeout(sendSystemOutput, delay, choice, position, seriesLength, done);

      if (done) {
         mode = 'in';
         seriesIndex = 0;
         setTimeout(resetUserInputTimer, (OUTPUT_DELAY * seriesLength), (OUTPUT_DELAY * seriesLength));
         return seriesLength;
      }
      else {
         seriesIndex += 1;
         return sendBlips();
      }
   }

   function validateBlip(choice) {
      var valid = false;
      var received = choice;
      var actual = series[seriesIndex];
      var position = seriesIndex + 1;
      var seriesLength = series.length;

      if (mode != 'in') {
         return;
      }

      if (received === actual) {
         seriesIndex += 1;
         valid = true;
         if (seriesIndex >= series.length) {
            // entire series is valid. 
            // switch to output mode to send new series
            mode = 'out';
            seriesIndex = 0;
            stopUserInputTimer();
            // Delay added to present last user inputs and first system output
            // overlapping each other
            setTimeout(sendBlips, (OUTPUT_DELAY * 2));
         } else {
            // valid but remaining series to be validated
            resetUserInputTimer();
         }
      }

      onUserInput(valid, received, actual, position, seriesLength);

      if (valid == false) {
         gameOver('LOST');
      }

      return valid;
   }

   return {
      isActive: function () {
         return mode != 'off';
      },
      start: function startGame() {
         mode = 'out';
         series = [];
         sendBlips();
      },
      stop: function stopGame() {
         gameOver('STOPPED');
      },
      sendUserInput: function sendInput(choice) {
         return choices.includes(choice) && validateBlip(choice);
      }
   };
}