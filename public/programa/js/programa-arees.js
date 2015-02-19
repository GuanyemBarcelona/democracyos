$(function () {

  var democracyHost = "",
    apiURL = democracyHost + "/stats/laws";

  var comments = {},
    program = [{
        "id": "area-0",
        "comments": 0,
        "lawId": "54e4ca47b690493300a94308"
    }, {
        "comments": 0,
        "id": "area-1",
        "lawId": "54e4d3b02d6bfa3500d369ab"
    }, {
        "comments": 0,
        "id": "area-2",
        "lawId": "54e4d5fdf455314b00718051"
    }, {
        "comments": 0,
        "id": "area-3",
        "lawId": "54e4d8adb690493300a9431a"
    }];

  function renderSubjectsData() {
    for (var i = 0; i < program.length; i++) {
      $("#" + program[i].id + " .count").html(program[i].comments);
      $("#" + program[i].id + " a").attr("href", democracyHost + "/law/" + program[i].lawId);
    }
  }

  function loadData() {
    $.ajax({
      "url": apiURL,
      "dataType": "json"
    }).done(function(data) {
      // Init comment count
      for (var i = 0; i < data.length; i++) {
        comments[data[i]._id] = data[i].total;
      }

      // Assign comments to program subjects
      for (var i = 0; i < program.length; i++) {
        program[i].comments = comments[program[i].lawId] || 0;
      }
      renderSubjectsData();
    });
  }


  function init() {
      loadData();
  }

  init();
});