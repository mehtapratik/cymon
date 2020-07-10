(function app(w, d) {
   var game;
   var choices = ["red", "green", "blue", "yellow"];
   var startStopButton = d.querySelector('#startStopBtn');
   var controlButtons = d.querySelectorAll('button[data-color]');
   var gamePad = d.querySelector('.cymon');
   var audioContext = new (window.AudioContext || window.webkitAudioContext)();
   var sounds = {
      red: [100, 200, 100],
      green: [300, 400, 100],
      blue: [200, 600, 100],
      yellow: [400, 800, 100],
      lost: [500, 50, 1000]
   };

   var keyCodes = {
      N: 78,
      E: 69,
      S: 83,
      W: 87,
      Zero: 48
   };

   function beep(vol, freq, duration) {
      v = audioContext.createOscillator()
      u = audioContext.createGain()
      v.connect(u)
      v.frequency.value = freq
      v.type = "square"
      u.connect(audioContext.destination)
      u.gain.value = vol * 0.01
      v.start(audioContext.currentTime)
      v.stop(audioContext.currentTime + duration * 0.001)
   }


   function resetControlButtons() {
      controlButtons.forEach(function turnOffButton(e) {
         e.classList.remove('cymon__btn--on');
      });
   }

   function glowAndPlay(choice) {
      var choiceBtn = document.querySelector(`button[data-color="${choice}"]`);
      var sound = sounds[choice];

      resetControlButtons();
      choiceBtn.classList.add('cymon__btn--on');
      beep(...sound);
      setTimeout(function () {
         resetControlButtons();
      }, 300);
   }

   function showOutput(choice, position, length, done) {
      glowAndPlay(choice);
      if (done) {
         gamePad.classList.add('cymon--mode-input');
      }
   }

   function sendInput(e) {
      console.log(game.getMode());
      if (game.getMode() == 'in') {
         var choice = this.getAttribute('data-color');
         glowAndPlay(choice);
         game.sendUserInput(choice);
      }
   }

   function processInputResponse(valid, received, actual, position, length) {
      if (position == length) {
         gamePad.classList.remove('cymon--mode-input');
      }
   }

   function endGame(reason) {
      gamePad.classList.remove('cymon--active');
      gamePad.classList.remove('cymon--mode-input');
      startStopButton.innerHTML = 'Start';

      if (['TIMED_OUT', 'LOST'].includes(reason)) {
         startStopButton.innerHTML = 'Game Over';
         resetControlButtons();
         beep(...sounds.lost);
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

      if (game.getMode() == 'off') {
         game.start();
         gamePad.classList.add('cymon--active');
         this.innerHTML = 'Stop';
      }
      else {
         game.stop();
         gamePad.classList.remove('cymon--active');
         this.innerHTML = 'Start';
      }
   }

   game = cymon(choices, showOutput, processInputResponse, endGame);

   startStopButton.addEventListener('click', startOrStopGame);
   controlButtons.forEach(function (e) {
      e.addEventListener('click', sendInput);
   });

   window.addEventListener('keydown', function handleKeyboardShortcuts(e) {
      switch (e.keyCode) {
         case keyCodes.N:
            controlButtons[0].click();
            break;
         case keyCodes.E:
            controlButtons[1].click();
            break;
         case keyCodes.S:
            controlButtons[2].click();
            break;
         case keyCodes.W:
            controlButtons[3].click();
            break;
         case keyCodes.Zero:
            startStopButton.click();
            break;
      }
   });

})(window, document);