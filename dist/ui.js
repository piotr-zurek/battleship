
let game;
$(document).ready(function () {
  game = Battleship();
  let playerScoore = 0;
  let cpuScoore = 0;

  $("#submitName").click(function (e) {
    e.preventDefault();

    $('.playerName').text($("#inputName").val());
    $("#form").hide();
    $('#board').show();
    $('.playerScoore').text();


    game.init();
  });

  game.onReady(function () {
    $("#player .field").unbind("click");
    $("#player .field").click(function () {
      let col = parseInt($(this).attr("data-col"));
      let row = parseInt($(this).attr("data-row"));
      if (game.stage() == game.STAGE_PREPARATION)
      game.placeShip(col, row);

      refreshUI();
    });
    refreshUI();
  });

  game.onStart(function () {
    alert("Let's start!");
    $("#player .field").unbind("click");

    $(".counter").show();

    $("#cpu .field").click(function () {
      let col = parseInt($(this).attr("data-col"));
      let row = parseInt($(this).attr("data-row"));
      if (game.stage() == game.STAGE_GAME)
      game.shoot(col, row);

      refreshUI();
    });

  });

  game.onFinish(function (player) {
    alert(player == game.ID_PLAYER ? 'Player won!' : 'CPU won!');

    if(player == game.ID_PLAYER) {
      playerScoore++;
    } else {
      cpuScoore++
    }

    $(".playerScoore").text(playerScoore);
    $(".cpuScoore").text(cpuScoore);

    game.restart();
  });



  function refreshUI() {
    //refresh CPU board
    let rows = game.ROWS;
    let cols = game.COLS;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let cpu = $(`#cpu [data-row=${row}][data-col=${col}]`);
        switch (game.cpuBoard()[col][row]) {
          case game.FIELD_HIT:
          cpu.css('background', 'green');
          break;
          case game.FIELD_MISS:
          cpu.css('background', 'red');
          break;
          default:
          cpu.css("background", "white");
        }

        //refresh player board
        let player = $(`#player [data-row=${row}][data-col=${col}]`);
        switch (game.playerBoard()[col][row]) {
          case game.FIELD_EMPTY:
          player.css("background", "white");
          break;
          case game.FIELD_SHIP:
          player.css("background", "black");
          break;
          case game.FIELD_HIT:
          player.css("background", "green");
          break;
          case game.FIELD_MISS:
          player.css("background", "red");
          break;
        }
      }
    }

    $(".playerCounter").val(game.playerLeft());
    $(".cpuCounter").val(game.cpuLeft());
  }

});
