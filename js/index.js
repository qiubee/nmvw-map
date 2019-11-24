// object met nmvw info
var nmvw = {
  apiURL: "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-05/sparql",
  apiQuery: "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n    PREFIX dc: <http://purl.org/dc/elements/1.1/>\n    PREFIX dct: <http://purl.org/dc/terms/>\n    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n    PREFIX edm: <http://www.europeana.eu/schemas/edm/>\n    PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n    PREFIX hdlh: <https://hdl.handle.net/20.500.11840/termmaster>\n    PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>\n    PREFIX geo: <http://www.opengis.net/ont/geosparql#>\n    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n    PREFIX gn: <http://www.geonames.org/ontology#>\n    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n    \n    SELECT ?continent ?countryName ?lat ?long ?category (COUNT(?cho) AS ?objCount) WHERE {\n      \n      # CONTINENTEN\n      # zoekt alle continenten\n      <https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?geoTerm .\n      ?geoTerm skos:prefLabel ?continent .\n    \n      # geeft per continent de onderliggende geografische termen\n      ?geoTerm skos:narrower* ?allGeoTerms .\n    \n      # geeft objecten bij de onderliggende geografische termen\n      ?cho dct:spatial ?allGeoTerms .\n    \n      # LANDEN\n      # zoekt in GeoNames naar de naam van het land\n      ?allGeoTerms skos:exactMatch/gn:parentCountry ?country .\n      ?country gn:name ?countryName .\n    \n      # COORDINATEN\n      # geeft de latitude en longtitude van het land (coordinaten zijn niet precies)\n      ?country wgs84:lat ?lat .\n      ?country wgs84:long ?long .\n      \n      # CATEGORIEEN\n      # zoekt alle hoofdcategorieen\n      <https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?catTerm .\n      ?catTerm skos:prefLabel ?category .\n      \n      # geeft per categorie alle onderliggende categorische termen\n      ?catTerm skos:narrower* ?allCatTerms .\n      \n      # geeft objecten bij alle onderliggende categorische termen\n      ?cho edm:isRelatedTo ?allCatTerms\n      \n    } GROUP BY ?continent ?countryName ?lat ?long ?category\n    ORDER BY DESC(?objCount)",
  continentCoordinates: [{
    continent: "Afrika",
    lat: 7,
    long: 21
  }, {
    continent: "Amerika",
    lat: 15,
    long: -90.5
  }, {
    continent: "Antarctica",
    lat: 78,
    long: 16
  }, {
    continent: "Azië",
    lat: 30,
    long: 89
  }, {
    continent: "Eurazië",
    lat: 49,
    long: 9
  }, {
    continent: "Oceanen",
    lat: 4,
    long: 132
  }, {
    continent: "Oceanië",
    lat: -6.5,
    long: 128.5
  }]
};

var projection = d3.geoPatterson();
var path = d3.geoPath().projection(projection); 

// -- Elementen aanmaken --
var title = d3.select("div").append("h2").text("Wereldkaart met populaire categorieën per continent en per land.");
var explanation = d3.select("div").append("p").text("Klik op een cirkel om in te zoomen en selecteer een land om dieper in de collectie te duiken.");
var svg = d3.select("div").append("svg").attr("viewBox", "50 0 850 496");
var legend = d3.select("div").append("h3").text("Legenda");
var legendContent = d3.select("div").append("p"); 

// --- Visualiseren ---
deleteNoScript();
drawMap();
configureData(nmvw.apiURL, nmvw.apiQuery);

// Verwijder noscript
function deleteNoScript() {
  d3.select("div").select("p").remove();
  d3.select("div").attr("class", null);
}

// Wereldkaart maken met d3
function drawMap() {
  // kaart maken met world-atlas (voorbeeld van: https://www.youtube.com/watch?v=Qw6uAg3EO64)
  d3.json("https://unpkg.com/world-atlas@1.1.4/world/110m.json").then(function (data) {
    var countries = topojson.feature(data, data.objects.countries);
    svg.selectAll("path").data(countries.features).enter().append("path").attr("class", "country").attr("d", function (d) {
      return path(d);
    });
  });
}

// Data op de wereldkaart zetten
// code gebruikt van: https://stackoverflow.com/questions/21397608/put-markers-to-a-map-generated-with-tocsript en https://stackoverflow.com/questions/26956778/plotting-points-on-a-map-with-d3-js)
function plotData(data) {
  svg.selectAll("circle").data(data).enter().append("circle").attr("class", "continent").attr("cx", function (d) {
    return projection([d.long, d.lat])[0];
  }).attr("cy", function (d) {
    return projection([d.long, d.lat])[1];
  }).attr("r", "1em");
}

// -- Data ophalen en verwerken --
function configureData(url, query) {
  var data;
  return regeneratorRuntime.async(function configureData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(getData(url, query));

        case 2:
          data = _context.sent;
          data = transformData(data);
          console.log("Transformed data: ", data);
          plotData(data);

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
}

// Data ophalen
function getData(url, query) {
  var response, json, data;
  return regeneratorRuntime.async(function getData$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(fetch(url + "?query=" + encodeURIComponent(query) + "&format=json"));

        case 2:
          response = _context2.sent;
          _context2.next = 5;
          return regeneratorRuntime.awrap(response.json());

        case 5:
          json = _context2.sent;
          data = json.results.bindings;
          return _context2.abrupt("return", data);

        case 8:
        case "end":
          return _context2.stop();
      }
    }
  });
} 

// Data transformeren
function transformData(data) {
  data = filterData(data);
  data = groupData(data);
  data = addContinentLatLong(data);
  data = calculateData(data); 
  return data;
}

// Data filteren
function filterData(data) {
  data = data.map(function (item) {
    var newArr = {};

    if (item.hasOwnProperty("placeName") === true) {
      newArr.place = item.placeName.value;
    }

    if (item.hasOwnProperty("continent") === true) {
      newArr.continent = item.continent.value;
    }

    if (item.hasOwnProperty("countryName") === true) {
      newArr.country = item.countryName.value;
    }

    if (item.hasOwnProperty("lat") === true) {
      newArr.lat = Number(item.lat.value);
    }

    if (item.hasOwnProperty("long") === true) {
      newArr.long = Number(item.long.value);
    }

    if (item.hasOwnProperty("category") === true) {
      newArr.category = item.category.value;
    }

    if (item.hasOwnProperty("objCount") === true) {
      newArr.objects = Number(item.objCount.value);
    }

    if (item.hasOwnProperty("type") === true) {
      newArr.type = item.type.value;
    }

    return newArr;
  });
  return data;
}

// Groepeer data
function groupData(data) {
  data = d3.nest().key(function (d) {
    return d.continent;
  }).key(function (d) {
    return d.country;
  }).entries(data);
  return data;
}

// Voeg coordinaten van continenten toe
function addContinentLatLong(data) {
  data.forEach(function (continent) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = nmvw.continentCoordinates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var nmvwCont = _step.value;

        if (continent.key === nmvwCont.continent) {
          continent.lat = nmvwCont.lat;
          continent.long = nmvwCont.long;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });
  return data;
}

// Maak berekeningen met data
function calculateData(data) {
  // tel alle landen van continent
  data.forEach(function (continent) {
    continent.countries = continent.values.length;
    return continent.countries;
  });
  
  // tel alle objecten
  var amount = 0;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var continent = _step2.value;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = continent.values[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var country = _step5.value;
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = country.values[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var category = _step6.value;
              amount += category.objects;
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  console.log("Total objects: ", amount); 
  
  // tel alle objecten van continent
  data.forEach(function (continent) {
    var objects = 0;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = continent.values[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var country = _step3.value;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = country.values[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var category = _step4.value;
            objects += category.objects;
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    continent.objects = objects;
    return continent.amount;
  });

  return data;
}