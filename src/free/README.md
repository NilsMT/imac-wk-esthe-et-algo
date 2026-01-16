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

Je voulais continuer sur la génération de caverne mais changer la perspective pour faire des îles, m'inspirant de [WorldBox](https://www.superworldbox.com/) cependant l'automate cellulaire de caverne ne fait pas un rendu convenable, j'ai donc utilisé du [Bruit de Perlin](https://en.wikipedia.org/wiki/Perlin_noise) en y ajoutant des "points chauds" qui correspondront aux positions des îles. J'ai également ajusté la génération pour que le plus éloigné reviens à être plus proche de 0 (l'eau profonde).
J'ai utilisé de l'IA pour une répartitions des types de cellules avec des poids, pour qu'elle soit moins linéaire.
