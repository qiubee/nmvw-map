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

const projection = d3.geoPatterson();
const path = d3.geoPath().projection(projection);
const scale = d3.scaleSqrt();

// -- Elementen aanmaken --
const title = d3
    .select("div")
    .append("h2")
    .text("Wereldkaart die de plaats van de vondst en de categorie van objecten in de collectie van het NMVW laat zien.");

const explanation = d3
    .select("div")
    .append("p")
    //.text("Klik op een cirkel om in te zoomen en selecteer een land om dieper in de collectie te duiken.");
    .text("Klik op een cirkel om de categorieën te tonen");

const svg = d3
    .select("div")
    .append("svg")
    .attr("viewBox", "50 0 850 496");

const legend = d3
    .select("div")
    .append("h3")
    .text("Legenda");

const legendContent = d3
    .select("div")
    .append("p");

// geef elke categorie een eigen kleur
const colors = d3.scaleOrdinal()
.domain(["communicatie", "kleding en persoonlijke versiering", "kunst", "wapens", "vestiging", "religie en ritueel", "voeding, drank, genotmiddelen", "nijverheid, handel en dienstverlening", "jacht, visserij, voedselgaring", "vervoer", "sociaal, politiek, juridisch", "land-, tuin- en bosbouw", "popular culture", "levenscyclus", "strijd en oorlog", "lichaamsverzorging, geneeskunde, persoonlijk comfort", "ontspanning, sport en spel", "veeteelt en producten", "onbepaald"])
.range(["#4B2259","#3C5D9E","#58CEED","#A1642B","#485922","#80B64E","#88e103","#F25C05","#4bc87d","#00A6A5","#ab04d9","#f2ca7e","#E3B58F","#b8c845","#f26d85","#734a19","#8c403a","#010326", "#314fef"]);

visualize();

// --- Visualiseren ---
async function visualize() {
deleteNoScript();
await drawMap();
const data = await configureData(nmvw.apiURL, nmvw.apiQuery);
plotData(data);
}

// Verwijder noscript
function deleteNoScript() {
    d3.select("div").select("p").remove();
    d3.select("div").attr("class", null);
}

// Wereldkaart maken met d3 
// kaart maken met world-atlas (voorbeeld van: https://www.youtube.com/watch?v=Qw6uAg3EO64)
async function drawMap() {
    const data = await d3.json("https://unpkg.com/world-atlas@1.1.4/world/110m.json");
    const countries = topojson.feature(data, data.objects.countries);
    svg.append("g")
        .attr("id", "countries")
        .selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", d => path(d));
}

// Data op de wereldkaart zetten. Code gebruikt van:
// https://stackoverflow.com/questions/21397608/put-markers-to-a-map-generated-with-tocsript 
// en https://stackoverflow.com/questions/26956778/plotting-points-on-a-map-with-d3-js)
function plotData(data) {

    // enter data
    svg.append("g")
        .attr("id", "continents")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("g")
        .attr("id", function (d) {
            return d.key;
        })
        .append("circle")
        .attr("cx", function (d) {
            return projection([d.long, d.lat])[0];
        })
        .attr("cy", function (d) {
            return projection([d.long, d.lat])[1];
        })
        .transition()
        .duration(1500)
        .attr("r", function(d) {
            return scale(d.objects) / 10;
        });

    // geef naam en objecten continent (transitie naam naar boven, objecten naar beneden)
    // text op cirkel zetten http://thenewcode.com/482/Placing-Text-on-a-Circle-with-SVG
    svg.selectAll("circle")
        .on("mouseover", function () {
            // haal data van geselecteerde continent
            let continent;
            for (let id of data) {
                if (id.key === this.__data__.key) {
                    continent = id;
                }
            }

            continentInfo = d3.select("#" + continent.key)
                .append("g")
                .attr("transform", "translate(" + (projection([continent.long, continent.lat])[0]) + " " + (projection([continent.long, continent.lat])[1]) + ")");

            // voeg tekst toe met naam continent
            continentInfo
                .append("text")
                .text(function (d) {
                    return d.key;
                })
                .style("transform", "translateY(-" + 2 + "em)");

            // voeg tekst toe met aantal objecten continent
            continentInfo
                .append("text")
                .text(function (d) {
                    return d.objects;
                })
                .style("transform", "translateY(" + 3 + "em)");

            // maak cirkelradius kleiner op hover
            d3.select(this)
                .attr("r", function (d) {
                    return scale(d.objects) / 10;
                })
                .transition()
                .attr("r", function (d) {
                    return ((scale(d.objects) / 10) - (scale(d.objects) / 120));
                });
        })
        .on("mouseout", function () {
            // zet cirkelradius terug op originele waarde
            d3.select(this)
                .attr("r", function (d) {
                    return ((scale(d.objects) / 10) - (scale(d.objects) / 120));
                })
                .transition()
                .attr("r", function (d) {
                    return (scale(d.objects) / 10);
                });

            // haal data van geselecteerde continent
            let continent;
            for (let id of data) {
                if (id.key === this.__data__.key) {
                    continent = id;
                }
            }

            // verwijder tekst
            d3.selectAll("#" + continent.key + " g")
                .remove();
        });

    // make bubble chart (voorbeeld gebruikt van: https://observablehq.com/@d3/zoom-to-bounding-box, 
    // https://observablehq.com/@rocss/test en https://observablehq.com/@mbostock/clustered-bubbles

    
    svg.selectAll("circle")
        .on("click", function () {
            // haal data van geselecteerde continent
            let continent;
            for (let id of data) {
                if (id.key === this.__data__.key) {
                    continent = id;
                }
            }

            d3.selectAll("#" + continent.key + " g")
                .remove();

            // zoom in op continent
            

            // verwijder cirkel continent
            d3.select(this)
                .on("mouseover", null)
                .on("mouseout", null)
                .transition()
                .attr("r", "0")
                .remove();

            // maak bubble chart van categorieen
            // (voorbeeld van: https://www.youtube.com/watch?v=lPr60pexvEM)

            const simulation = d3.forceSimulation()
                    // uit elkaar halen
                    .force("charge", d3.forceManyBody())
                    // centreer
                    .force("center", d3.forceCenter(0))
                    // op breedte forceren
                    .force("y", d3.forceY(0))
                    // op lengte forceren 
                    .force("x", d3.forceX(0))
                    // laten botsen
                    .force("collide", d3.forceCollide(function (d) { 
                        return (scale(d.objects) / 10) + 2; 
                    })); 
                    

            simulation.nodes(continent.categories)
                .on("tick", function () {
                    circles
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    });
                });

            const circles = svg.selectAll("#" + continent.key)
                .append("g")
                .attr("class", "categories")
                .attr("transform", "translate(" + (projection([continent.long, continent.lat])[0]) + " " + (projection([continent.long, continent.lat])[1]) + ")")
                .selectAll(".categories")
                .data(continent.categories)
                .enter()
                .append("g")
                .append("circle")
                .attr("r", function (d) {
                    return scale(d.objects) / 10;
                })
                .style("fill", function (d) {
                    return colors(d.key);
                })
                // nodes slepen (functies om node te slepen van: https://observablehq.com/@rocss/test)
                .call(d3.drag()
                    .on("start", dragstart)
                    .on("drag", dragged)
                    .on("end", dragend));

                function dragstart(d) {
                        if (!d3.event.active) simulation.alphaTarget(1).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                      }
                    
                function dragged(d) {
                        d.fx = d3.event.x;
                        d.fy = d3.event.y;
                      }
                    
                function dragend(d) {
                        if (!d3.event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                      }
                // -------

                // toon info van categorie op hover
                svg.selectAll("#" + continent.key + " g g")
                .append("title")
                .text(function (d) {
                    return `Categorie: ${d.key}\n Aantal objecten: ${d.objects}`;
                });
            
        });
    }

// -- Data ophalen en verwerken --
async function configureData(url, query) {
    let data = await getData(url, query);
    // console.log("Raw data: ", data);
    data = transformData(data);
    //console.log("Transformed data: ", data);
    return data;
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
    // data = translateCountryToDutch(data);
    // console.log("Translated country data: ", data);
    data = groupData(data);
    // console.log("Grouped data: ", data);
    data = addLatLong(data);
    // console.log("Add coordinates: ", data);
    data = calculateData(data);
    // console.log("Calculated data: ", data);  
    return data;
}

// Data filteren
function filterData(data) {
    data = data.map(item => {
        let filtered = {};
        if (item.hasOwnProperty("placeName") === true) {
            filtered.place = item.placeName.value;
        }
        if (item.hasOwnProperty("continent") === true) {
            filtered.continent = item.continent.value;
        }
        if (item.hasOwnProperty("countryName") === true) {
            filtered.country = item.countryName.value;
        }
        if (item.hasOwnProperty("lat") === true) {
            filtered.lat = Number(item.lat.value);
        }
        if (item.hasOwnProperty("long") === true) {
            filtered.long = Number(item.long.value);
        }
        if (item.hasOwnProperty("category") === true) {
            filtered.category = item.category.value;
        }
        if (item.hasOwnProperty("objCount") === true) {
            filtered.objects = Number(item.objCount.value);
        }
        if (item.hasOwnProperty("type") === true) {
            filtered.type = item.type.value;
        }
        return filtered;
    });
    
    return data;
}

// Groepeer data
function groupData(data) {
    data = d3.nest()
        // groepeer per continent
        .key(function (d) {
            return d.continent; 
        })
        // groepeer per land
        .key(function (d) {
            return d.country;
        })
        .entries(data);

    // groepeer categorieen per land
    data.forEach(function (continent) {
        for (let country of continent.values) {
            let listOfCategories = [];
            for (let info of country.values) {
                category = { category: info.category, objects: info.objects };
                listOfCategories.push(category);
            }
            country.categories = listOfCategories;
        }
    });

    // groepeer categorieen per continent
    data.forEach(function (continent) {
        let categories = [];
        for (let country of continent.values) {
            for (let category of country.categories) {
                categories.push(category);
            }
        }

        categories = d3.nest()
            .key(function (d) {
                return d.category;
            })
            .entries(categories);

        continent.categories = categories;
    });

    return data;
}

// Voeg coordinaten toe aan continent en land
function addLatLong(data) {
    
    data.forEach(function (continent){
            // voeg coordinaten toe aan continent
            for (let nmvwCont of nmvw.continentCoordinates)
            if (continent.key === nmvwCont.continent) {
                continent.lat = nmvwCont.lat;
                continent.long = nmvwCont.long;
            }
            
            // voeg coordinaten toe aan land
            for (let country of continent.values) {
                country.lat = country.values[0].lat;
                country.long = country.values[0].long;
            }
    });

    return data;
}

// Maak berekeningen met data
function calculateData(data) {

    // tel alle landen van continent
    data.forEach(function (continent) {
        continent.countries = continent.values.length;
    });

    // telt alle objecten
    // let amount = 0;
    // for (let continent of data) {
    //     for (let country of continent.values) {
    //         for (let category of country.values) {
    //             amount += category.objects;
    //         }
    //     }
    // }
    // console.log("Total objects: ", amount);

    // tel alle objecten van land
    data.forEach(function (continent) {
        for (let country of continent.values) {
            let objects = 0;
            for (let info of country.values) {
                objects += info.objects;
            }
            country.objects = objects;
        }
    });

    // tel alle objecten van continent
    data.forEach(function (continent) {
        let objects = 0;
        for (let country of continent.values) {
            objects += country.objects;
        }
        continent.objects = objects;
    });

    // tel alle objecten per categorie van continent
    data.forEach(function (continent) {
        for (let category of continent.categories) {
            let objects = 0;
            for (let info of category.values) {
                objects += info.objects;
            }
            category.objects = objects;
        }
    });

    return data;
}
