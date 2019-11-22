/*jshint esversion: 8 */

// import { translateCountryToDutch } from "./translateCountryToDutch.js";

// object met nmvw info
const nmvw = {
    apiURL: "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-05/sparql",
    apiQuery: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX edm: <http://www.europeana.eu/schemas/edm/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX hdlh: <https://hdl.handle.net/20.500.11840/termmaster>
    PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX gn: <http://www.geonames.org/ontology#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?continent ?countryName ?lat ?long ?category (COUNT(?cho) AS ?objCount) WHERE {
      
      # CONTINENTEN
      # zoekt alle continenten
      <https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?geoTerm .
      ?geoTerm skos:prefLabel ?continent .
    
      # geeft per continent de onderliggende geografische termen
      ?geoTerm skos:narrower* ?allGeoTerms .
    
      # geeft objecten bij de onderliggende geografische termen
      ?cho dct:spatial ?allGeoTerms .
    
      # LANDEN
      # zoekt in GeoNames naar de naam van het land
      ?allGeoTerms skos:exactMatch/gn:parentCountry ?country .
      ?country gn:name ?countryName .
    
      # COORDINATEN
      # geeft de latitude en longtitude van het land (coordinaten zijn niet precies)
      ?country wgs84:lat ?lat .
      ?country wgs84:long ?long .
      
      # CATEGORIEEN
      # zoekt alle hoofdcategorieen
      <https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?catTerm .
      ?catTerm skos:prefLabel ?category .
      
      # geeft per categorie alle onderliggende categorische termen
      ?catTerm skos:narrower* ?allCatTerms .
      
      # geeft objecten bij alle onderliggende categorische termen
      ?cho edm:isRelatedTo ?allCatTerms
      
    } GROUP BY ?continent ?countryName ?lat ?long ?category
    ORDER BY DESC(?objCount)`,
    continentCoordinates: [{
        continent: "Afrika",
        lat: 7,
        long: 21
    }, {
        continent: "Amerika",
        lat: 8,
        long: 73
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
        lat: 18,
        long: 139
    }]
};

const projection = d3.geoPatterson();
const path = d3.geoPath().projection(projection);

// -- Elementen aanmaken --
const title = d3
    .select("#map")
    .append("h2")
    .text("Overzicht categorieën van collectie NMVW per land.");

const explanation = d3
    .select("#map")
    .append("p")
    .text("Klik op een cirkel om in te zoomen en selecteer een land om dieper in de collectie te duiken.");

const svg = d3
    .select("#map")
    .append("svg")
    .attr("viewBox", "50 0 850 496");

const legend = d3
    .select("#map")
    .append("h3")
    .text("Legenda");

const legendContent = d3
    .select("#map")
    .append("p");

// -- Haal data op en schoon het op --
configureData(nmvw.apiURL, nmvw.apiQuery);

// -- Maak wereldkaart --
drawMap();


// Wereldkaart maken met d3
function drawMap() {
    // kaart maken met world-atlas (voorbeeld van: https://www.youtube.com/watch?v=Qw6uAg3EO64)
    d3.json("https://unpkg.com/world-atlas@1.1.4/world/110m.json")
        .then(data => {
            const countries = topojson.feature(data, data.objects.countries);
            svg.selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("class", "country")
                .attr("d", d => path(d));
        });
}

// Data op de wereldkaart zetten
// code gebruikt van: https://stackoverflow.com/questions/21397608/put-markers-to-a-map-generated-with-topojson-and-d3-js en https://stackoverflow.com/questions/26956778/plotting-points-on-a-map-with-d3-js)

function plotData(data) {
    svg.selectAll("circle")
            .data(data)
        .enter()
            .append("circle")
            .attr("class", "continent")
            .attr("cx", function (d) {
                return projection([d.long, d.lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.long, d.lat])[1];
            });
}

// -- Data ophalen en verwerken --

async function configureData(url, query) {
    let data = await getData(url, query);
    // console.log("Raw data: ", data);
    data = transformData(data);
    // console.log("Transformed data: ", data);
    plotData(data);
    //return data;
}

// Data ophalen
async function getData(url, query) {
    const response = await fetch(url + "?query=" + encodeURIComponent(query) + "&format=json");
    const json = await response.json();
    const data = json.results.bindings;
    return data;
}

// Data transformeren
function transformData(data) {
    data = filterData(data);
    // console.log("Filtered data: ", data);
    // translateCountryToDutch(data);
    // console.log("Translated country data: ", data);
    data = groupData(data);
    // console.log("Grouped data: ", data);
    data = addContinentLatLong(data);
    console.log("Added coordinates continents :", data);
    // data = calculateData(data);
    // console.log("Calculated data: ", data);
    return data;
}

// Data filteren
function filterData(data) {
    data = data.map(item => {
        let newArr = {};
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
    data = d3.nest()
        .key(function (d) {
            return d.continent;
        })
        .key(function (d) {
            return d.country;
        })
        .entries(data);
    return data;
}


// Voeg coordinaten van continenten toe
function addContinentLatLong(data) {
    data.forEach(function (continent){
            for (let nmvwCont of nmvw.continentCoordinates)
            if (continent.key === nmvwCont.continent) {
                continent.lat = nmvwCont.lat;
                continent.long = nmvwCont.long;
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

    // telt alle objecten
    let amount = 0;
    for (let continent of data) {
        for (let country of continent.values) {
            for (let category of country.values) {
                amount += category.objects;
            }
        }
    }
    console.log("Totaal objecten: ", amount);

    // tel alle objecten van continent ---> Tip danny: loop over de key en values van het object
    data.forEach(function (continent) {
        let objects = 0;
        for (let country of continent.values) {
            for (let category of country.values) {
                objects += category.objects;
            }
        }
        continent.objects = objects;
        return continent.amount;
    });

    // tel alle objecten van land
    // nestedData.forEach(function (country) {
    //     country.amount = country.amount;
    //     return country.amount;
    // });

    return data;
}

// maak bubble chart bij klikken op cirkel van continent met update()