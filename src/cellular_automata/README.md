# Automates Cellulaires

Explorations d'algorithmes d'automates cellulaires pour la génération de structures organiques et l'émergence de comportements complexes.

## Structure

```
├───cavern_1 : Génération simple de cavernes
├───cavern_2 : Génération de cavernes avec expérimentations sur les motifs intérieurs
├───conway : Le jeu de la vie de Conway
├───minecraft_1 : Générateur de terrain style Minecraft (avancé)
└───minecraft_2 : Générateur de terrain style Minecraft (basique)
```

## Interactions

Il est possible de dessiner en cliquant sur une case.

La touche <kbd>Entrée ⏎</kbd> permet de mettre en pause ou de reprendre, et la touche <kbd>R</kbd> permet de réinitialiser le plateau.

## Projets

### **cavern_1** - Génération Simple de Cavernes

Implémentation de base d'un algorithme de génération de cavernes utilisant des automates cellulaires.
L'algo utilise une règle simple :

```
Si une cellule est un mur et avec 4+ voisin, ou qu'elle est vide mais avec 5+ voisins, alors elle est un mur
Sinon elle devient vide
```

Cela permet d'isoler les petits bruits

### **cavern_2** - Génération de Cavernes Expérimentale

Extension de cavern_1 avec des variations expérimentales sur les motifs intérieurs.
Qui ne s'effectue qu'après une génération normale des cavernes, avec les règles suivantes :

```
Si une cellule a 7+ voisins alors elle meurt, sinon elle vie

Règles additionnelle (règle B)
Si une cellule a 6+ voisins alors elle vie, sinon elle meurt
```

### **conway** - Le Jeu de la Vie de Conway

Implémentation classique du célèbre automate cellulaire de Conway. Un système où des cellules "vivent" ou "meurent" selon des règles simples :

```
Si une cellule vivante a 2-3 voisins, elle survit
Si une cellule morte a exactement 3 voisins, elle renaît
Sinon elle meurent par isolement ou disparaissent par surpopulation
```

### **minecraft_1** - Générateur de Terrain Simple

Déclinaison de `cavern_1` en typant les cellules vivantes à un bloc, puis en effectuant une répartition probabilistique en fonction de la profondeur des minerais

> ⚠️ ChatGPT m'a aidé pour cette répartition car je n'avais pas assez de connaissances dans les probabilités.

### **minecraft_2** - Générateur de Terrain Avancé

Réécriture de ``minecraft_1` mais en essayant par moi même la répartition probabilistique
