# Wereldkaart met populaire categorieën per continent en per land

Deze interactieve datavisualisatie is gemaakt met d3. Verder zijn Node.js en Express gebruikt voor het bouwen van de applicatie.

**[Bekijk interactieve datavisualisatie](https://qiubee.github.io/frontend-data/)**

## Benodigdheden

* Node.js
* Express
* d3

Andere benodigdheden zijn te vinden in [`package.json`](https://github.com/qiubee/frontend-data/blob/master/package.json)

## Concept

Een interactieve datavisualisatie waarmee je de collectie van het Nationaal Museum van Wereldculturen kunt verkennen. Kijk op de wereldkaart waar objecten in de collectie zijn gevonden. Elk object in de collectie is gecategoriseerd. Met een cirkeldiagram wordt de categorieën met de meeste objecten weergegeven. Klik op een van deze cirkels om dieper de collectie in te duiken om te ontdekken wat er verbogen zit in de collectie.

## Installeren

Doe het volgende in de terminal om te installeren:

1. `git clone https://github.com/qiubee/frontend-data.git`
2. `npm install`
3. `npm start`

Ga naar `localhost:8000` in de browser om de interactieve visualisatie te bekijken.

## Data

De data is opgehaald met de API van het NMVW. Het NMVW gebruikt SPARQL voor het ophalen van data uit de collectie. De data die is opgehaal is:

* Geografische herkomst
* Categorie van object
* Aantal objecten per werelddeel

In SPARQL is `dct:spatial` en `dc:type` gebruikt om de plaats en het type van het object op te halen. En met `(COUNT() AS())` zijn het aantal objecten op bij elkaar opgeteld.

Dit is de query die gebruikt is voor het ophalen van de data:

```SPARQL
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?placeName ?type (COUNT(?obj) AS ?objAmount)  WHERE {
    # <hier de link uit thesaurus van werelddeel>
    skos:narrower* ?place .
    ?obj dc:type ?type ;
         dct:spatial ?place .
    ?place skos:prefLabel ?placeName .
}
ORDER BY DESC(?objAmount)
```

## Licentie

**[MIT](https://github.com/qiubee/functional-programming/blob/master/LICENSE)**
