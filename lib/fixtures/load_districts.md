### To load the laws by district do... ###
```
node ./bin/dos-db load law ./lib/fixtures/districte_ciutat_vella.json --U mongodb://URL
node ./bin/dos-db load law ./lib/fixtures/districte_eixample.json --U mongodb://URL
node ./bin/dos-db load law ./lib/fixtures/districte_gracia.json --U mongodb://URL
node ./bin/dos-db load law ./lib/fixtures/districte_horta_guinardo.json --U mongodb://URL
node ./bin/dos-db load law ./lib/fixtures/districte_les_corts.json --U mongodb://URL
node ./bin/dos-db load law ./lib/fixtures/districte_nou_barris.json --U mongodb://URL
node ./bin/dos-db load law ./lib/fixtures/districte_sant_andreu.json --U mongodb://URL
node ./bin/dos-db load law ./lib/fixtures/districte_sant_marti.json --U mongodb://URL
node ./bin/dos-db load law ./lib/fixtures/districte_sants_montjuic.json --U mongodb://URL
node ./bin/dos-db load law ./lib/fixtures/districte_sarria_sant_gervasi.json --U mongodb://URL
```

### To make them all public do...###
```
db.laws.update({}, {$set: {publishedAt: new Date()}}, {multi: true})
```