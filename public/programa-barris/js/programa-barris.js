$(function () {

  var democracyHost = "",
    apiURL = democracyHost + "/stats/laws";

  // Dummy data
  var program = [],
    districts = [],
    comments = {};

  /*function renderSubjectsData() {
    for (var i = 0; i < program.length; i++) {
      $("#" + program[i].id + " .count").html(program[i].comments);
      $("#" + program[i].id + " a").attr("href", democracyHost + "/law/" + program[i].lawId);
    }
  }*/

  function renderDistrictNeighborhoods(d) {
    $(".pgm-diagnosis-list ul").empty();
    var distNeigTemplate = tmpl("districtNeighborhood_tmpl"),
      neigTemplate = tmpl("neighborhood_tmpl");

    var distNeigHTML = distNeigTemplate({
      "comments": districts[d].ownComments,
      "district": districts[d].name,
      "lawURL": democracyHost + "/law/" + districts[d].lawId
    });
    $(".pgm-diagnosis-list ul").append(distNeigHTML);

    for (var i = 0; i < districts[d].neighborhoods.length; i++) {
      var neigHTML = neigTemplate({
        "comments": districts[d].neighborhoods[i].comments,
        "neighborhood": districts[d].neighborhoods[i].name,
        "lawURL": democracyHost + "/law/" + districts[d].neighborhoods[i].lawId
      });
      $(".pgm-diagnosis-list ul").append(neigHTML);
      $("#counter-" + districts[d].neighborhoods[i].id +
        " tspan").html(districts[d].neighborhoods[i].comments);
    }
  }

  function renderDistrictsData(d) {
    $(".pgm-diagnosis-list ul").empty();
    for (var i = 0; i < districts.length; i++) {
      renderDistrictData(i);
    }
  }

  function renderDistrictData(d) {
    var distTemplate = tmpl("district_tmpl");

    var distHTML = distTemplate({
      "comments": districts[d].comments,
      "districtId": districts[d].id,
      "district": districts[d].name,
      "lawURL": democracyHost + "/law/" + districts[d].lawId
    });

    $(".pgm-diagnosis-list ul").append(distHTML);
    $("#counter-" + districts[d].id + " tspan").html(districts[d].comments);
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

      // // Assign comments to program subjects
      // for (var i = 0; i < program.length; i++) {
      //   program[i].comments = comments[program[i].lawId] || 0;
      // }
      // renderSubjectsData();

      // Assign comments to districts and neighborhoods
      for (var i = 0; i < districts.length; i++) {
        var neighborhoodsCount = 0;
        for (var j = 0; j < districts[i].neighborhoods.length; j++) {
          districts[i].neighborhoods[j].comments += comments[districts[i].neighborhoods[j].lawId] || 0;
          neighborhoodsCount += districts[i].neighborhoods[j].comments;
        }
        districts[i].ownComments += comments[districts[i].lawId] || 0;
        districts[i].comments = neighborhoodsCount + districts[i].ownComments;
      }

      renderDistrictsData();
    });
  }


  function bindDiagnosis() {
    $("#global-map").on("click", "path", function(evt) {
      console.log("Show district: %s", evt.currentTarget.id);
      var idx = districtIndex(evt.currentTarget.id);
      if(idx !== undefined) {
        renderDistrictNeighborhoods(idx);
        showDiagnosisMap(idx);
      }
    });

    $(".pgm-diagnosis-map-entry").not("#global-map").on("click", "path", function(evt) {
      var lawId = neighborhoodLaw(evt.currentTarget.id);
      console.log("Navigate neighborhood: %s", lawId);
      if(lawId !== undefined) {
        window.location = democracyHost + "/law/" + lawId;
      }
    });

    $(".pgm-back-global").on("click", function(evt) {
      showDiagnosisMap();
      renderDistrictsData();
    });

    $(".pgm-diagnosis-list").on("click", ".pgm-neighborhood-drill-down", function(evt) {
      var districtId = $(evt.currentTarget).data("id");
      console.log("Show: %s", districtId);
      var idx = districtIndex(districtId);
      if(idx !== undefined) {
        renderDistrictNeighborhoods(idx);
        showDiagnosisMap(idx);
      }
    });
  }

  function showDiagnosisMap(idx) {
    $(".pgm-diagnosis-map-entry").addClass("pgm-hidden");
    if(idx === undefined) {
      $("#global-map").removeClass("pgm-hidden");
    } else {
      $("#" + districts[idx].id + "-map").removeClass("pgm-hidden");
    }
  }

  function neighborhoodLaw(neighborhoodId) {
    for (var i = 0; i < districts.length; i++) {
      for (var j = 0; j < districts[i].neighborhoods.length; j++) {
        if(districts[i].neighborhoods[j].id === neighborhoodId) {
          return districts[i].neighborhoods[j].lawId;
        }
      }
    }
    return;
  }

  function districtIndex(districtId) {
    for (var i = 0; i < districts.length; i++) {
      if(districts[i].id === districtId) {
        return i;
      }
    }
    return;
  }

  function init() {
      //loadProgramSubjects();
      loadData();
      bindDiagnosis();
  }

  var cache = {};
  function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };

  districts = [{
      "comments": 0,
      "ownComments": 12,
      "id": "ciutat-vella",
      "lawId": "550fd9655186edd623bfd255",
      "name": "Ciutat Vella",
      "neighborhoods": [{
          "name": "La Barceloneta",
          "comments": 5,
          "id": "barceloneta",
          "lawId": "550fd9655186edd623bfd256"
      }, {
          "name": "El Gòtic",
          "comments": 5,
          "id": "gotic",
          "lawId": "550fd9655186edd623bfd257"
      }, {
          "name": "El Raval",
          "comments": 4,
          "id": "raval",
          "lawId": "550fd9655186edd623bfd258"
      }, {
          "name": "Sant Pere, Santa Caterina i la Ribera",
          "comments": 4,
          "id": "sant-pere",
          "lawId": "550fd9655186edd623bfd259"
      }]
  },{
      "comments": 0,
      "ownComments": 5,
      "id": "eixample",
      "lawId": "550fd5bcff887bd9209ace1b",
      "name": "Eixample",
      "neighborhoods": [{
          "name": "L'Antiga Esquerra de l'Eixample",
          "comments": 3,
          "id": "antiga-esquerra",
          "lawId": "550fd5bcff887bd9209ace1c"
      }, {
          "name": "La Nova Esquerra de l'Eixample",
          "comments": 3,
          "id": "nova-esquerra",
          "lawId": "550fd5bcff887bd9209ace1e"
      }, {
          "name": "La Dreta de l'Eixample",
          "comments": 1,
          "id": "dreta-eixample",
          "lawId": "550fd5bcff887bd9209ace1d"
      }, {
          "name": "Fort Pienc",
          "comments": 3,
          "id": "fort-pienc",
          "lawId": "550fd5bcff887bd9209ace1f"
      }, {
          "name": "Sagrada Família",
          "comments": 10,
          "id": "sagrada-familia",
          "lawId": "550fd5bcff887bd9209ace20"
      }, {
          "name": "Sant Antoni",
          "comments": 6,
          "id": "sant-antoni",
          "lawId": "550fd5bcff887bd9209ace21"
      }]
  },{
      "comments": 0,
      "ownComments": 0,
      "id": "gracia",
      "lawId": "550fd7f88d777f8923e1fac3",
      "name": "Gràcia",
      "neighborhoods": [{
          "name": "Vila de Gràcia",
          "comments": 4,
          "id": "vila-gracia",
          "lawId": "550fd7f88d777f8923e1fac2"
      }, {
          "name": "Camp d'en Grassot i Gràcia Nova",
          "comments": 3,
          "id": "camp-grassot",
          "lawId": "550fd7f88d777f8923e1fac6"
      }, {
          "name": "La Salut",
          "comments": 0,
          "id": "salut",
          "lawId": "550fd7f88d777f8923e1fac5"
      }, {
          "name": "El Coll",
          "comments": 4,
          "id": "coll",
          "lawId": "550fd7f88d777f8923e1fac7"
      }, {
          "name": "Vallcarca i els Penitents",
          "comments": 3,
          "id": "vallcarca-penitents",
          "lawId": "550fd7f88d777f8923e1fac4"
      }]
  },{
      "comments": 0,
      "ownComments": 4,
      "id": "horta-guinardo",
      "lawId": "550fd7ffebbf4e8a23cdd54e",
      "name": "Horta Guinardó",
      "neighborhoods": [{
          "name": "El Baix Guinardó",
          "comments": 1,
          "id": "baix-guinardo",
          "lawId": "550fd7ffebbf4e8a23cdd54d"
      }, {
          "name": "El Guinardó",
          "comments": 2,
          "id": "guinardo",
          "lawId": "550fd7ffebbf4e8a23cdd551"
      }, {
          "name": "Can Baró",
          "comments": 3,
          "id": "can-baro",
          "lawId": "550fd7ffebbf4e8a23cdd550"
      }, {
          "name": "El Carmel",
          "comments": 1,
          "id": "carmel",
          "lawId": "550fd7ffebbf4e8a23cdd552"
      }, {
          "name": "Font d'en Fargues",
          "comments": 2,
          "id": "font-fargues",
          "lawId": "550fd7ffebbf4e8a23cdd554"
      }, {
          "name": "Horta",
          "comments": 2,
          "id": "horta",
          "lawId": "551059ca0c59980f00932422"
      }, {
          "name": "La Clota",
          "comments": 2,
          "id": "clota",
          "lawId": "550fd7ffebbf4e8a23cdd555"
      }, {
          "name": "Montbau",
          "comments": 2,
          "id": "montbau",
          "lawId": "550fd7ffebbf4e8a23cdd553"
      }, {
          "name": "Sant Genís dels Agudells",
          "comments": 2,
          "id": "sant-genis",
          "lawId": "550fd7ffebbf4e8a23cdd557"
      }, {
          "name": "La Teixonera",
          "comments": 2,
          "id": "teixonera",
          "lawId": "550fd7ffebbf4e8a23cdd558"
      }, {
          "name": "La Vall d'Hebron",
          "comments": 2,
          "id": "vall-hebron",
          "lawId": "550fd7ffebbf4e8a23cdd556"
      }]
  },{
      "comments": 0,
      "ownComments": 0,
      "id": "les-corts",
      "lawId": "550fd804a2eebc8b233d8377",
      "name": "Les Corts",
      "neighborhoods": [{
          "name": "Les Corts",
          "comments": 5,
          "id": "corts",
          "lawId": "550fd804a2eebc8b233d8375"
      }, {
          "name": "La Maternitat i Sant Ramon",
          "comments": 3,
          "id": "maternitat",
          "lawId": "550fd804a2eebc8b233d8376"
      }, {
          "name": "Pedralbes",
          "comments": 3,
          "id": "pedralbes",
          "lawId": "550fd804a2eebc8b233d8378"
      }]
  },{
      "comments": 0,
      "ownComments": 0,
      "id": "nou-barris",
      "lawId": "550fd809c2965b8c230971ea",
      "name": "Nou Barris",
      "neighborhoods": [{
          "name": "Can Peguera",
          "comments": 2,
          "id": "can-peguera",
          "lawId": "550fd809c2965b8c230971ec"
      }, {
          "name": "Canyelles",
          "comments": 3,
          "id": "canyelles",
          "lawId": "550fd809c2965b8c230971ed"
      }, {
          "name": "Ciutat Meridiana",
          "comments": 4,
          "id": "ciutat-meridiana",
          "lawId": "550fd809c2965b8c230971eb"
      }, {
          "name": "La Guineueta",
          "comments": 3,
          "id": "guineueta",
          "lawId": "550fd809c2965b8c230971f1"
      }, {
          "name": "Porta",
          "comments": 5,
          "id": "porta",
          "lawId": "550fd809c2965b8c230971ee"
      }, {
          "name": "Prosperitat",
          "comments": 4,
          "id": "prosperitat",
          "lawId": "550fd809c2965b8c230971f0"
      }, {
          "name": "Les Roquetes",
          "comments": 4,
          "id": "roquetes",
          "lawId": "550fd809c2965b8c230971f2"
      }, {
          "name": "Torre Baró",
          "comments": 5,
          "id": "torre-baro",
          "lawId": "550fd809c2965b8c230971ef"
      }, {
          "name": "La Trinitat Nova",
          "comments": 4,
          "id": "trinitat-nova",
          "lawId": "550fd809c2965b8c230971f4"
      }, {
          "name": "El Turó de la Peira",
          "comments": 2,
          "id": "turo-peira",
          "lawId": "550fd809c2965b8c230971f3"
      }, {
          "name": "Vallbona",
          "comments": 8,
          "id": "vallbona",
          "lawId": "550fd809c2965b8c230971f6"
      }, {
          "name": "Verdum",
          "comments": 2,
          "id": "verdum",
          "lawId": "550fd809c2965b8c230971f7"
      }, {
          "name": "Vilapicina i la Torre Llobeta",
          "comments": 2,
          "id": "vilapicina",
          "lawId": "550fd809c2965b8c230971f5"
      }]
  },{
      "comments": 0,
      "ownComments": 5,
      "id": "sant-andreu",
      "lawId": "550fd80c8999608d237efd08",
      "name": "Sant Andreu",
      "neighborhoods": [{
          "name": "Baró de Viver",
          "comments": 3,
          "id": "baro-viver",
          "lawId": "550fd80c8999608d237efd06"
      }, {
          "name": "Bon Pastor",
          "comments": 4,
          "id": "bon-pastor",
          "lawId": "550fd80c8999608d237efd09"
      }, {
          "name": "El Congrés i els Indians",
          "comments": 1,
          "id": "congres",
          "lawId": "550fd80c8999608d237efd0a"
      }, {
          "name": "Navas",
          "comments": 1,
          "id": "navas",
          "lawId": "550fd80c8999608d237efd0b"
      }, {
          "name": "Sant Andreu de Palomar",
          "comments": 7,
          "id": "sant-andreu-b",
          "lawId": "550fd80c8999608d237efd07"
      }, {
          "name": "La Sagrera",
          "comments": 3,
          "id": "sagrera",
          "lawId": "550fd80c8999608d237efd0c"
      }, {
          "name": "Trinitat Vella",
          "comments": 3,
          "id": "trinitat-vella",
          "lawId": "550fd80c8999608d237efd0d"
      }]
  },{
      "comments": 0,
      "ownComments": 7,
      "id": "sant-marti",
      "lawId": "550fd8102c40f38e232f6424",
      "name": "Sant Martí",
      "neighborhoods": [{
          "name": "El Besòs i el Maresme",
          "comments": 3,
          "id": "besos-maresme",
          "lawId": "550fd8102c40f38e232f6426"
      }, {
          "name": "El Clot",
          "comments": 7,
          "id": "clot",
          "lawId": "550fd8102c40f38e232f642c"
      }, {
          "name": "El Camp de l'Arpa del Clot",
          "comments": 3,
          "id": "camp-arpa",
          "lawId": "550fd8102c40f38e232f642a"
      }, {
          "name": "Diagonal Mar i el Front Marítim del Poblenou",
          "comments": 3,
          "id": "diagonal-mar",
          "lawId": "550fd8102c40f38e232f6428"
      }, {
          "name": "El Parc i la Llacuna del Poblenou",
          "comments": 4,
          "id": "parc-llacuna",
          "lawId": "550fd8102c40f38e232f6425"
      }, {
          "name": "El Poblenou",
          "comments": 6,
          "id": "poblenou",
          "lawId": "550fd8102c40f38e232f6429"
      }, {
          "name": "Provençals del Poblenou",
          "comments": 6,
          "id": "provencals",
          "lawId": "550fd8102c40f38e232f642d"
      }, {
          "name": "Sant Martí de Provençals",
          "comments": 1,
          "id": "sant-marti-provencals",
          "lawId": "550fd8102c40f38e232f642b"
      }, {
          "name": "La Verneda i la Pau",
          "comments": 2,
          "id": "verneda",
          "lawId": "550fd8102c40f38e232f6427"
      }, {
          "name": "La Vila Olímpica del Poblenou",
          "comments": 2,
          "id": "vila-olimpica",
          "lawId": "550fd8102c40f38e232f642e"
      }]
  }, {
      "comments": 0,
      "ownComments": 1,
      "id": "sants-montjuic",
      "lawId": "550fd814c7a2218f239b35b8",
      "name": "Sants Montjuïc",
      "neighborhoods": [{
          "name": "La Bordeta",
          "comments": 5,
          "id": "bordeta",
          "lawId": "550fd814c7a2218f239b35b6"
      }, {
          "name": "La Font de la Guatlla",
          "comments": 2,
          "id": "font-guatlla",
          "lawId": "550fd814c7a2218f239b35b7"
      }, {
          "name": "Hostafrancs",
          "comments": 4,
          "id": "hostafrancs",
          "lawId": "550fd814c7a2218f239b35b9"
      }, {
          "name": "La Marina de Port",
          "comments": 8,
          "id": "marina-port",
          "lawId": "550fd814c7a2218f239b35bb"
      }, {
          "name": "La Marina del Prat Vermell",
          "comments": 5,
          "id": "marina-prat",
          "lawId": "550fd814c7a2218f239b35bd"
      }, {
          "name": "El Poble-sec",
          "comments": 14,
          "id": "poble-sec",
          "lawId": "550fd814c7a2218f239b35ba"
      }, {
          "name": "Sants",
          "comments": 6,
          "id": "sants",
          "lawId": "550fd814c7a2218f239b35bc"
      }, {
          "name": "Sants-Badal",
          "comments": 3,
          "id": "sants-badal",
          "lawId": "550fd814c7a2218f239b35be"
      }]
  },{
      "comments": 0,
      "ownComments": 3,
      "id": "sarria-sant-gervasi",
      "lawId": "550fd81a4e905a902375a47a",
      "name": "Sarrià - Sant Gervasi",
      "neighborhoods": [{
          "name": "El Putget i Farró",
          "comments": 2,
          "id": "putget",
          "lawId": "550fd81a4e905a902375a47c"
      }, {
          "name": "Sarrià",
          "comments": 3,
          "id": "sarria",
          "lawId": "550fd81a4e905a902375a47b"
      }, {
          "name": "Sant Gervasi - la Bonanova",
          "comments": 1,
          "id": "bonanova",
          "lawId": "550fd81a4e905a902375a47d"
      }, {
          "name": "Sant Gervasi - Galvany",
          "comments": 3,
          "id": "galvany",
          "lawId": "550fd81a4e905a902375a47f"
      }, {
          "name": "Les Tres Torres",
          "comments": 3,
          "id": "tres-torres",
          "lawId": "550fd81a4e905a902375a47e"
      }, {
          "name": "Vallvidrera, el Tibidabo i les Planes",
          "comments": 5,
          "id": "vallvidrera",
          "lawId": "550fd81a4e905a902375a480"
      }]
  }];

  // program = [{
  //     "id": "area-0",
  //     "comments": 0,
  //     "lawId": "54d92283da5b280f0070051b"
  // }, {
  //     "comments": 0,
  //     "id": "area-1",
  //     "lawId": "54d923d418fe6663aae5d801"
  // }, {
  //     "comments": 0,
  //     "id": "area-2",
  //     "lawId": "54d923df18fe6663aae5d802"
  // }, {
  //     "comments": 0,
  //     "id": "area-3",
  //     "lawId": "54d923eb18fe6663aae5d803"
  // }];


  init();


});