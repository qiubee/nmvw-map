/*jshint esversion: 8 */

import { api, queries } from "./api.js";

// coordinaten continenten
const coordinates = [{
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
    }];

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

// geef elke categorie een eigen kleur
const colors = d3.scaleOrdinal()
.domain(["communicatie", "kleding en persoonlijke versiering", "kunst", "wapens", "vestiging", "religie en ritueel", "voeding, drank, genotmiddelen", "nijverheid, handel en dienstverlening", "jacht, visserij, voedselgaring", "vervoer", "sociaal, politiek, juridisch", "land-, tuin- en bosbouw", "popular culture", "levenscyclus", "strijd en oorlog", "lichaamsverzorging, geneeskunde, persoonlijk comfort", "ontspanning, sport en spel", "veeteelt en producten", "onbepaald"])
.range(["#4B2259","#3C5D9E","#58CEED","#A1642B","#485922","#80B64E","#88e103","#F25C05","#4bc87d","#00A6A5","#ab04d9","#f2ca7e","#E3B58F","#b8c845","#f26d85","#734a19","#8c403a","#010326", "#314fef"]);

visualize();

// --- Visualiseren ---
async function visualize() {
	deleteNoScript();
	await drawMap();
	const data = await configureData(api.generalURL, queries.queryCCT);
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
    const data = await d3.json("js/data/countries-110m.json");
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
            return d.continent;
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
                if (id.continent === this.__data__.continent) {
                    continent = id;
                }
			}
			
            let continentInfo = d3.select("#" + continent.continent)
                .append("g")
                .attr("transform", "translate(" + (projection([continent.long, continent.lat])[0]) + " " + (projection([continent.long, continent.lat])[1]) + ")");

            // voeg tekst toe met naam continent
            continentInfo
                .append("text")
                .text(function (d) {
                    return d.continent;
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
                if (id.continent === this.__data__.continent) {
                    continent = id;
                }
            }

            // verwijder tekst
            d3.selectAll("#" + continent.continent + " g")
                .remove();
        });

    // make bubble chart (voorbeeld gebruikt van: https://observablehq.com/@d3/zoom-to-bounding-box, 
    // https://observablehq.com/@rocss/test en https://observablehq.com/@mbostock/clustered-bubbles

    
    svg.selectAll("circle")
        .on("click", function () {
            // haal data van geselecteerde continent
            let continent;
            for (let id of data) {
                if (id.continent === this.__data__.continent) {
                    continent = id;
                }
            }

            d3.selectAll("#" + continent.continent + " g")
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

            const circles = svg.selectAll("#" + continent.continent)
                .append("g")
                .attr("class", "categories")
                .attr("transform", "translate(" + (projection([continent.long, continent.lat])[0]) + " " + (projection([continent.long, continent.lat])[1]) + ")")
                .selectAll(".categories")
                .data(continent.categories)
                .enter()
                .append("g")
                .append("circle")
                .attr("r", function (d) {
                    return scale(d.objects) / 7.5;
                })
                .style("fill", function (d) {
                    return colors(d.category);
                })
                // nodes slepen (functies om node te slepen van: https://observablehq.com/@rocss/test)
                .call(d3.drag()
                    .on("start", dragstart)
                    .on("drag", dragged)
                    .on("end", dragend));

                function dragstart(event, d) {
						if (!event.active) simulation.alphaTarget(1).restart();
                        d.fx = d.x;
                        d.fy = d.y;
					  }
                    
                function dragged(event, d) {
                        d.fx = event.x;
                        d.fy = event.y;
                      }
                    
                function dragend(event, d) {
						if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
					  }
                // -------

                // toon info van categorie op hover
                svg.selectAll("#" + continent.continent + " g g")
                .append("title")
                .text(function (d) {
                    return `Categorie: ${d.category}\n Aantal objecten: ${d.objects}`;
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
	if (response.ok && response.status === 200) {
		return await response.json();
	}
	else {
		return await d3.json("js/data/CTT.json");
	}
}

// Data transformeren
function transformData(data) {
    data = filterData(data);
    // console.log("Filtered data: ", data);
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
	data = data.map(function (item) {
		if (item.objCount) {
			item.objects = Number(item.objCount);
			delete item.objCount;
		}
		return item;
	});
    return data;
}

// Groepeer data
function groupData(data) {
    data = d3.nest()
	// groepeer per continent
		.key(function (d) {
			return d.continent; 
		}).entries(data);
		
	// groepeer categorieen per continent en hernoem keys
	data.map(function (continent) {
		Object.defineProperty(continent, "categories", Object.getOwnPropertyDescriptor(continent, "values"));
		Object.defineProperty(continent, "continent", Object.getOwnPropertyDescriptor(continent, "key"));
		["key", "values"].forEach(function (key) {
			delete continent[key];
		});
		return continent;
	});

    return data;
}

// Voeg coordinaten toe aan continent en land
function addLatLong(data) {
    data.map(function (continent){
            // voeg coordinaten toe aan continent
            for (let item of coordinates)
            if (continent.continent === item.continent) {
                continent.lat = item.lat;
                continent.long = item.long;
            }
    });
    return data;
}

// Maak berekeningen met data
function calculateData(data) {

    // tel alle objecten per categorie per continent
	data.map(function (continent) {
		continent.objects = 0;
		for (let category of continent.categories) {
			continent.objects += category.objects;
		}
	});
    return data;
}
