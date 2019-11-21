// object met nmvw info
const nmvw = {
    apiURL: "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-05/sparql",
    apiOriginalQuery: `
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
      
    }`,
    apiCatAndCont: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
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
    
    SELECT ?placeName ?category (COUNT(?cho) AS ?objCount) WHERE {
      
      # CONTINENTEN
      # zoek op continent Antartica
      <https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?geoTerm .
      ?geoTerm skos:prefLabel ?placeName .
    
      # geef van Oceanen de onderliggende geografische termen
      ?geoTerm skos:narrower* ?allGeoTerms .
    
      # geef objecten bij de onderliggende geografische termen
      ?cho dct:spatial ?allGeoTerms .
      
      # CATEGORIEEN
      # zoek alle categorieen
      <https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?catTerm .
      ?catTerm skos:prefLabel ?category .
      
      # geef per categorie de onderliggende categorische termen
      ?catTerm skos:narrower* ?allCatTerms .
      
      # geef objecten bij de onderliggende categorische termen
      ?cho edm:isRelatedTo ?allCatTerms .
      
    } ORDER BY DESC(?objCount)`,
    apiCatContCoord: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
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
    continentCoordinates: [{continent: "Afrika", lat: 7, long: 21}, {continent: "Amerika", lat: 8, long: 73}, {continent: "Antarctica", lat: 78, long:16}, {continent: "Azië", lat: 30, long: 89}, {continent: "Eurazië", lat: 49, long: 9}, {continent: "Oceanen", lat: 4, long: 132}, {continent: "Oceanië", lat: 18, long: 139}] 
};

// -- Visualiseren met d3 --

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

// -- Data ophalen --
getData(nmvw.apiURL, nmvw.apiCatContCoord);

// data ophalen met async / await
async function getData(url, query) {
    const response = await fetch(url+ "?query=" + encodeURIComponent(query) + "&format=json");
    const json = await response.json();
    const data = json.results.bindings;
    console.log("Rauwe data: ", data);

    // data transformeren
    const normalizedData = data.map(item => {
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
            newArr.amount = Number(item.objCount.value);
        }
        if (item.hasOwnProperty("type") === true) {
            newArr.type = item.type.value;
        }
        return newArr;
    });
    console.log("Getransformeerde data: ", normalizedData);

    // data groeperen
    let nestedData = d3.nest()
                            .key(function (d) { return d.continent; })
                            .key(function (d) { return d.country; })
                            .entries(normalizedData);                  
    nestedData.forEach(function (continent) {
        continent.countries = continent.values.length;
        return continent.countries;
    });
    console.log("Gegroepeerde data: ", nestedData);
}