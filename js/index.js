// object met nmvw info
const nmvw = {
    apiURL: "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-05/sparql",
    apiQuery: `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX edm: <http://www.europeana.eu/schemas/edm/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
    SELECT ?placeName ?type (COUNT(?obj) AS ?objCount)  WHERE {
        <https://hdl.handle.net/20.500.11840/termmaster6025> skos:narrower* ?place .
        ?obj dc:type ?type ;
             dct:spatial ?place .
        ?place skos:prefLabel ?placeName .
    }
    ORDER BY DESC(?objCount)`,
    continentLinks: ["https://hdl.handle.net/20.500.11840/termmaster6025", "https://hdl.handle.net/20.500.11840/termmaster3", "https://hdl.handle.net/20.500.11840/termmaster8401", "https://hdl.handle.net/20.500.11840/termmaster6782", "https://hdl.handle.net/20.500.11840/termmaster19804", "https://hdl.handle.net/20.500.11840/termmaster18062"], // Europa, Afrika, Azie, Oceanie, Amerika, Noordpool, Antartica
    apiContinents: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
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
    
    SELECT ?geoTerm ?placeName (COUNT(?cho) AS ?objCount) WHERE {
      # zoek alle continenten
      <https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?geoTerm .
      ?geoTerm skos:prefLabel ?placeName .
    
      # geef per continent de onderliggende geografische termen
      ?geoTerm skos:narrower* ?allGeoTerms .
    
      # geef objecten bij de onderliggende geografische termen
      ?cho dct:spatial ?allGeoTerms .
      
    } GROUP BY ?geoTerm ?placeName`,
    apiCategories: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
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
    
    SELECT ?category (COUNT(?cho) AS ?objCount) WHERE {
      # geef de categorieen
      <https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?catTerm .
      ?catTerm skos:prefLabel ?category .
      
      # geef per categorie de onderliggende categorische termen
      ?catTerm skos:narrower* ?allCatTers .
      
      # geef objecten bij de onderliggende categorische termen
      ?cho edm:isRelatedTo ?allCatTerms .
      
    }`
};

getData(nmvw.apiURL, nmvw.apiContinents);

// visualiseren met d3

// elementen aanmaken
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

// wereldkaart maken met d3
const projection = d3.geoPatterson();
const path = d3.geoPath().projection(projection);

// kaart maken met world-atlas (voorbeeld van: https://www.youtube.com/watch?v=Qw6uAg3EO64)
d3.json("https://unpkg.com/world-atlas@1.1.4/world/110m.json")
    .then(data => {
        const countries = topojson.feature(data, data.objects.countries);

        svg.selectAll("path")
            .data(countries.features)
            .enter()
            .append("path")
            .attr("d", d => path(d));
    });

// data ophalen met async / await
async function getData(url, query) {
    const response = await fetch(url+ "?query=" + encodeURIComponent(query) + "&format=json");
    const json = await response.json();
    const data = await json.results.bindings;
    console.log(data);
    const normalizedData = await data.map(item => {
        let newArr = {};
        switch (item) {
            case item.objCount.value:
                console.log("amount added");
                newArr.amount = Number(item.objCount.value);
                break;
            case (item.type.value !== undefined):
                newArr.type = item.type.value;
                break;
            case item.placeName.value:
                newArr.place = item.placeName.value;
                break;
        }
        return newArr;
    });
    console.log(normalizedData);
    return normalizedData;
}