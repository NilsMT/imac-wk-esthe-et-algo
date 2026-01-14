# Fractales

Explorations de la génération de structures fractales auto-similaires utilisant la récursion.

## Structure

```
└───fractal_1 : Arbre fractal récursif avec particules
```

## Projets

### **fractal_1** - Arbre fractal récursif

Génération d'arbres fractals utilisant un algorithme d'arbre binaire récursif. Chaque branche se divise en deux sous-branches avec un angle configurable, créant une structure auto-similaire à plusieurs niveaux. Des particules animées parcourent l'arborescence en empruntant aléatoirement les chemins disponibles.

Il y a des particules qui explore l'arbre aléatoirement

### Réflexion & Conception

Je voulais d'abord faire un générateur de montagne en 3D en utilisant le fractal aléatoire [DLA](https://en.wikipedia.org/wiki/Diffusion-limited_aggregation) mais prenant conscience de mes limites j'ai réfléchi à comment exploité un fractal, et j'ai juste pensé aux [Arbres binaires de recherche](https://en.wikipedia.org/wiki/Binary_search_tree) avec l'exploration de chaque noeuds.
Ce qui ici pourrait être une particule explorant le fractal aléatoirement. L'arbre utilise le fractal [d'arbre canopé](https://en.wikipedia.org/wiki/Fractal_canopy) mais modifié pour être radial.
