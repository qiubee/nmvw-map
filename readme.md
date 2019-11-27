# Wereldkaart met populaire categorieën per continent en per land

Voor een nieuwe tentoonstelling over de collectie van het Tropenmuseum in Amsterdam wil tentoonstellingmaker Rik Herder met visualisaties laten zien wat er in een groter geheel te vinden is in de collectie van het Nationaal Museum van Wereldculturen. Zijn insteek is om de iconen van de collectie uit te lichten. Hij heeft de opdracht gegeven om een van zo'n datavisualisatie te laten maken.

De visualisatie is een interactieve wereldkaart die het aantal objecten per continent en land laat zien en de verdeling laat zien van categorieën per continent en land.

![World map with pie charts showing top 3 of categories with the most objects found in the collection of the National Museum of Worldcultures](images/concept-small-cut.jpg)

De data is afkomstig van de collectie van het Nationaal Museum van Wereldculturen. Deze interactieve datavisualisatie is gemaakt met d3. Verder zijn Node.js en Express gebruikt voor het bouwen van de applicatie.

**[Bekijk interactieve wereldkaart](https://qiubee.github.io/frontend-data/)**

## Concept

Een interactieve wereldkaart die het aantal objecten per continent laat zien en de verdeling laat zien van categorieën per continent. Als er een continent wordt geselecteerd, wordt er ingezoomt op het continent. Dan is het mogelijk om een land te selecteren. Als er een land is geselecteerd, verschijnt er een bubble chart die de verdeling van categorieën laat zien.

## Benodigdheden

* Node.js
* Express
* d3

Andere benodigdheden zijn te vinden in [`package.json`](https://github.com/qiubee/frontend-data/blob/master/package.json)

## Installeren

Doe het volgende in de terminal om de app te installeren:

1. `git clone https://github.com/qiubee/frontend-data.git`
2. `npm install`
3. `npm start`

Ga naar `localhost:8000` in de browser om de interactieve visualisatie te bekijken.

## Data

De data is opgehaald uit de database van het NMVW. Het NMVW gebruikt daarvoor SPARQL. De data die wordt opgehaald bestaat uit:

* Continent
* Land
* Coördinaten van het land
* Hoofdcategorieën van objecten
* Totaal aantal objecten per categorie

Hoe de data is opgehaald is te zien in de wiki, ga naar *[Proces SPARQL](https://github.com/qiubee/frontend-data/wiki/SPARQL)* om het te bekijken.

## Bronnen

* [Making a World Map with D3](https://www.youtube.com/watch?v=Qw6uAg3EO64)
* [Stackoverflow: Put markers to a map generated with topoJSON and d3.js](https://stackoverflow.com/questions/21397608/put-markers-to-a-map-generated-with-tocsript)
* [Stackoverflow: Plotting Points on a Map with d3.js](https://stackoverflow.com/questions/26956778/plotting-points-on-a-map-with-d3-js)
* [Placing text on a circle with SVG](http://thenewcode.com/482/Placing-Text-on-a-Circle-with-SVG)
* [Observable: Zoom to bounding box](https://observablehq.com/@d3/zoom-to-bounding-box)
* [Observable: Force bubbles](https://observablehq.com/@rocss/test)
* [Observable: Clustered bubbles](https://observablehq.com/@mbostock/clustered-bubbles)

## Licentie

**[MIT](https://github.com/qiubee/functional-programming/blob/master/LICENSE)**
