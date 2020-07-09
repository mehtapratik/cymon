(function app(w, d) {
   var game;
   var choices = ["red", "green", "blue", "yellow"];
   var startStopButton = d.querySelector('#startStopBtn');
   var controlButtons = d.querySelectorAll('button[data-color]');
   var gamePad = d.querySelector('.cymon');

   function resetControlButtons() {
      controlButtons.forEach(function turnOffButton(e) {
         e.classList.remove('cymon__btn--on');
      });
   }

   function glowAndPlay(choice) {
      var choiceBtn = document.querySelector(`button[data-color="${choice}"]`);


      resetControlButtons();
      choiceBtn.classList.add('cymon__btn--on');

      setTimeout(function () {
         resetControlButtons();
      }, 300);
   }

   function showOutput(choice, position, length, done) {
      glowAndPlay(choice);
   }

   function sendInput(e) {
      if (game.isActive()) {
         var choice = this.getAttribute('data-color');
         glowAndPlay(choice);
         game.sendUserInput(choice);
      }
   }

   function processInputResponse(valid, received, actual, position, length) {

   }

   function endGame(reason) {
      gamePad.classList.remove('cymon--active');
      startStopButton.innerHTML = 'Start';

      if (['TIMED_OUT', 'LOST'].includes(reason)) {
         startStopButton.innerHTML = 'Game Over';
         resetControlButtons();
         gamePad.classList.add('cymon--game-over');
         setTimeout(function () {
            startStopButton.innerHTML = 'Start';
            gamePad.classList.remove('cymon--game-over');
         }, 2000);
      }
   }

   function startOrStopGame() {
      if (gamePad.classList.contains('cymon--game-over')) {
         return;
      }

      if (game.isActive()) {
         game.stop();
         gamePad.classList.remove('cymon--active');
         this.innerHTML = 'Start';
      }
      else {
         game.start();
         gamePad.classList.add('cymon--active');
         this.innerHTML = 'Stop';
      }
   }

   game = cymon(choices, showOutput, processInputResponse, endGame);

   startStopButton.addEventListener('click', startOrStopGame);
   controlButtons.forEach(function (e) {
      e.addEventListener('click', sendInput);
   });

})(window, document);