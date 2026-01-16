# Fractales

Explorations de la génération de structures fractales auto-similaires utilisant la récursion.

## Structure

```
└───island: Générateur et éditeur d'île
```

## Projets

### **island** - Générateur et éditeur d'îles

Un générateur d'îles qui utilise du Bruit de Perlin, avec un éditeur inclus !

### Réflexion & Conception

Je voulais continuer sur la génération de caverne mais changer la perspective pour faire des îles, m'inspirant de [WorldBox](https://www.superworldbox.com/) cependant l'automate cellulaire de caverne ne fait pas un rendu convenable, j'ai donc utilisé du [Bruit de Perlin](https://en.wikipedia.org/wiki/Perlin_noise) en y ajoutant des "points chauds" qui correspondront aux positions des îles. J'ai également ajusté la génération pour que le plus éloigné reviens à être plus proche de 0 (l'eau profonde).
J'ai utilisé de l'IA pour une répartitions des types de cellules avec des poids, pour qu'elle soit moins linéaire.
