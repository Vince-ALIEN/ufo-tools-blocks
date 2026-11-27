# Blocs UFO Tools Blocks : guide pour un assistant IA

Guide pour un assistant qui lit et écrit le contenu d'un site WordPress par l'API REST
(`post_content`, balisage sérialisé des blocs). Il est livré avec le plugin et mis à jour à
chaque version : la copie qui fait foi est celle du site,
`GET /wp-json/ufo-tools-blocks/v1/guide` (utilisateur connecté avec `edit_posts`), qui
renvoie aussi la version du plugin installée.

## 1. Avant d'écrire

1. **Version du site** : `GET /wp-json/ufo-tools-blocks/v1/guide` → `version`. À partir de
   **1.1.0**, tous les blocs `ufo-blocks/*` sont rendus par le serveur (section 3). Sur un site
   en version inférieure, ne pas modifier les blocs statiques à la main (section 6).
2. **Blocs disponibles et attributs** :
   `GET /wp-json/wp/v2/block-types?namespace=ufo-blocks&context=edit` donne pour chaque bloc
   ses attributs (type, défaut, `enum`), `parent`, `description` et un `example` valide.
   N'utiliser **aucun attribut absent de cette liste**.
3. **Partir d'un modèle** : un pattern (`GET /wp-json/wp/v2/block-patterns/patterns`) ou une
   page existante (`GET /wp-json/wp/v2/pages/<id>?context=edit` → `content.raw`) plutôt qu'un
   assemblage de zéro.
4. **Vérifier avant d'enregistrer** : `POST /wp-json/ufo-tools-blocks/v1/check` avec
   `{ "content": "<balisage>" }` (section 5).
5. **Enregistrer en brouillon ou en révision**, puis faire relire.

## 2. Rôle des blocs et combinaisons

| Bloc | Rôle | Enfants |
|---|---|---|
| `ufo-blocks/ufo-grid` | Grille de 1 à 6 colonnes (une seule sur mobile) | `ufo-row` (ou `core/image`) |
| `ufo-blocks/ufo-row` | Cellule de grille : placement, hauteur, fond | n'importe quels blocs |
| `ufo-blocks/ufo-title` | Titre h1–h6 avec icône Lucide sur fond arrondi | aucun (texte = attribut `content`) |
| `ufo-blocks/ufo-heading-group` | Étiquette au-dessus d'un titre de section | `core/paragraph` (classe `tag`) puis `core/heading` |
| `ufo-blocks/ufo-icon` | Icône Lucide seule | aucun |
| `ufo-blocks/ufo-buttons-group` | Rangée de boutons alignés | `ufo-button` |
| `ufo-blocks/ufo-button` | Bouton lien avec icône | aucun |
| `ufo-blocks/ufo-faq` | FAQ en accordéon + JSON-LD FAQPage | `ufo-faq-item` |
| `ufo-blocks/ufo-faq-item` | Une question (attribut `question`) et sa réponse | paragraphes, listes… |
| `ufo-blocks/ufo-tabs` | Onglets accessibles au clavier | `ufo-tab` |
| `ufo-blocks/ufo-tab` | Un onglet (attribut `title`) | n'importe quels blocs |
| `ufo-blocks/ufo-time-line` | Frise chronologique verticale | `ufo-time-line-item` |
| `ufo-blocks/ufo-time-line-item` | Une étape : `date`, `title`, `icon` dans un marqueur rond | paragraphes, listes… |

`ufo-row`, `ufo-faq-item`, `ufo-tab` et `ufo-time-line-item` ne s'utilisent que dans leur
parent.

**Pages et articles** : `ufo-grid` et `ufo-row` (mise en page) sont réservés aux **pages**.
Un **article** n'utilise que les autres blocs UFO, placés entre les paragraphes, au premier
niveau. Envoyer `"post_type"` à `/check` pour que le site le vérifie (règle ajustable par site
avec le filtre `ufo_tools_blocks_check_disallowed_blocks`).

Combinaisons usuelles :

- **Section de services** : `ufo-grid` (`columnsCount` 3, `gap` "6", `equalRows` false) → 3 `ufo-row` → chacune
  un `ufo-title` (niveau 3, icône) + `core/paragraph`.
- **Appel à l'action** : `ufo-buttons-group` → 1 ou 2 `ufo-button`.
- **Questions fréquentes** : `ufo-faq` → un `ufo-faq-item` par question, réponse en
  `core/paragraph` / `core/list`.
- **Offres alternatives** : `ufo-tabs` → un `ufo-tab` par offre.
- **Introduction de section** : `ufo-heading-group` → `core/paragraph` (`"className":"tag"`,
  style du thème possible : `tag is-style-tag-primary`) + `core/heading` (niveau 2). Couleurs,
  marges, alignement (`wide`, `full`) et ancre par les supports WordPress.
- **Parcours, calendrier, étapes d'une démarche** : `ufo-time-line` → un `ufo-time-line-item`
  par étape, détail en `core/paragraph` / `core/list`.

## 3. Balisage (version 1.1.0 et suivantes)

Le contenu enregistré ne contient **que les commentaires de blocs avec leurs attributs** et
les blocs enfants : aucun HTML d'enveloppe. Ne jamais écrire de `<div>`, `<details>` ou de
classes Tailwind pour ces blocs : le serveur les produit à l'affichage.

```html
<!-- wp:ufo-blocks/ufo-grid {"columnsCount":3,"gap":"6","equalRows":false} -->
<!-- wp:ufo-blocks/ufo-row -->
<!-- wp:ufo-blocks/ufo-title {"content":"Création de site","level":3,"icon":"Code"} /-->

<!-- wp:paragraph -->
<p>Des sites WordPress rapides et accessibles.</p>
<!-- /wp:paragraph -->
<!-- /wp:ufo-blocks/ufo-row -->
<!-- /wp:ufo-blocks/ufo-grid -->

<!-- wp:ufo-blocks/ufo-faq {"schemaName":"Questions fréquentes"} -->
<!-- wp:ufo-blocks/ufo-faq-item {"question":"Proposez-vous la maintenance ?"} -->
<!-- wp:paragraph -->
<p>Oui, avec un contrat annuel.</p>
<!-- /wp:paragraph -->
<!-- /wp:ufo-blocks/ufo-faq-item -->
<!-- /wp:ufo-blocks/ufo-faq -->

<!-- wp:ufo-blocks/ufo-buttons-group {"buttonAlignment":"center"} -->
<!-- wp:ufo-blocks/ufo-button {"buttonText":"Demander un devis","buttonUrl":"/contact/","buttonIcon":"ArrowRight"} /-->
<!-- /wp:ufo-blocks/ufo-buttons-group -->

<!-- wp:ufo-blocks/ufo-time-line -->
<!-- wp:ufo-blocks/ufo-time-line-item {"icon":"Search","date":"Septembre","title":"Premier rendez-vous"} -->
<!-- wp:paragraph -->
<p>Nous faisons le point sur vos besoins.</p>
<!-- /wp:paragraph -->
<!-- /wp:ufo-blocks/ufo-time-line-item -->
<!-- /wp:ufo-blocks/ufo-time-line -->
```

Règles :

- Les blocs **sans enfants** (`ufo-title`, `ufo-icon`, `ufo-button`) s'écrivent en
  commentaire auto-fermant `<!-- wp:… /-->`.
- Les attributs sont du **JSON** : guillemets doubles, nombres sans guillemets
  (`"columnsCount":3`), chaînes pour les valeurs Tailwind (`"gap":"6"`, `"paddingX":"4"`).
- Un attribut égal à sa valeur par défaut peut être omis.
- Dans une valeur HTML (`question`, `content`, `buttonText`, `date`, `title`), le texte peut contenir
  `<strong>`, `<em>`, `<a href>`. Échapper `<`, `>` et `&` en `<`, `>`, `&`
  comme le fait WordPress (`wp_json_encode` / `serialize_block_attributes`), et ne jamais
  écrire `--` dans un commentaire de bloc.
- Les blocs du cœur (`core/paragraph`…) gardent leur HTML habituel.

Les contenus enregistrés avant la 1.1.0 contiennent encore l'ancien HTML statique : ils
s'affichent comme avant et passent au nouveau format à la prochaine sauvegarde dans
l'éditeur. Lors d'une modification par l'API, **réécrire le bloc entier au nouveau format**
plutôt que de retoucher l'ancien HTML.

## 4. Valeurs acceptées

| Attribut | Blocs | Valeurs |
|---|---|---|
| `columnsCount` | grid | nombre 1 à 6 |
| `breakpoint` | grid | `"none"` (colonnes à toutes les largeurs, mobile compris), `"sm"`, `"md"` (défaut), `"lg"`, `"xl"` : largeur à partir de laquelle les cellules forment des colonnes (empilées en dessous) |
| `rowsCount` | grid | nombre 0 (auto) à 6 |
| `gap` | grid | `"0"` à `"8"` |
| `paddingX`, `paddingY` | grid, row | `"0"`, `"2"`, `"4"` … `"16"` (pairs) |
| `marginTop` (row), `ufoMarginTop` (`core/image`) | row, image | `""` (aucune), `"2"` … `"16"` (pairs) : marge au-dessus ; `"-2"` … `"-16"` : décalage vers le haut. À toutes les largeurs |
| `verticalAlignment` | grid, row | `"top"`, `"center"`, `"bottom"` (ou absent) |
| `minHeight` | grid | `""`, `"24"` … `"150"`, `"h-full"`, `"screen"` |
| `minHeight` | row | `""`, `"24"` … `"150"`, `"full"`, `"screen"` |
| `height` | row | `""`, `"24"` … `"150"`, `"screen"` |
| hauteurs `"24"` … `"150"` | grid, row | `24 32 40 48 56 64 72 80 96 120 150` |
| `borderRadius` | grid, row | `""`, `"sm"`, `"md"`, `"lg"`, `"xl"`, `"2xl"`, `"3xl"` |
| `colSpan`, `rowSpan` | row | `""`, `"1"` à `"6"` |
| `colStart` / `colEnd` | row | `"1"`–`"7"` / `"1"`–`"8"` |
| `rowStart` / `rowEnd` | row | `"1"`–`"7"` |
| `reverseMobile`, `isBoxed` | grid | `true` / `false` |
| `equalRows` | grid | `true` / `false` : **écrire `false`** pour une nouvelle grille (comme l'éditeur), `true` seulement si une cellule couvre plusieurs lignes. Absent = `true` (sens des grilles déjà enregistrées). |
| `backgroundImage` | grid, row | `{"url":"…","id":123,"alt":""}` (média de la bibliothèque) |
| `backgroundVideo` | grid | `{"url":"….mp4","id":123}` |
| `buttonAlignment` | buttons-group | `"left"`, `"center"`, `"right"` |
| `iconPosition` | button | `"left"`, `"right"` |
| `level` | title | nombre 1 à 6 |
| `titleAlignment` | title | `"left"`, `"center"`, `"right"` |
| `enableSchema` | faq | `true` (défaut) / `false` |
| `schemaName`, `schemaDescription`, `schemaAbout` | faq | texte brut, facultatif |
| `textColor`, `markerColor` | time-line-item | slug de la palette du thème (titre / icône) |
| `customTextColor`, `customMarkerColor` | time-line-item | même couleur en `"#rrggbb"` : bordure de la date / fond du marqueur (à 15 %) ; sans elle, marqueur violet par défaut |

Styles de bloc (`className`) : `ufo-button` accepte `is-style-primary` (défaut) et
`is-style-secondary`.

**Icônes** (`icon` de `ufo-title` / `ufo-icon` / `ufo-time-line-item`, `buttonIcon` de
`ufo-button`) : nom Lucide en CamelCase, parmi ceux que le plugin sait rendre :
AlarmClockPlus, Apple, ArrowLeft, ArrowRight, ArrowUpRight, Briefcase, Calendar, ChartBar,
ChartNoAxesCombined, ChevronDown, ChevronLeft, ChevronRight, Clock, Code, Coffee, Database,
Digit0 … Digit9 (chiffres), Download, Flame, Globe, GraduationCap, Handshake, HardDriveDownload, Headphones, Heart, Home,
Key, Leaf, Lightbulb, Lock, Mail, Map, MapPin, MessageCirclePlus, Microscope, Moon, MoveRight,
MoveUpRight, Pen, PenTool, Phone, Plane, Rocket, Search, Send, Server, Settings, Shield,
ShieldCheck, ShoppingBag, Sparkles, SquareArrowOutUpRight, Star, Sun, Target, TriangleAlert,
Upload, User. Une icône hors liste n'est pas affichée.

Couleurs : utiliser les supports WordPress (`backgroundColor`, `textColor` avec un slug de
la palette du thème, `style`) plutôt que des classes.

## 5. Vérification côté serveur

`POST /wp-json/ufo-tools-blocks/v1/check` (utilisateur avec `edit_posts`), corps JSON
`{ "content": "<balisage complet>", "post_type": "post" }`, 1 Mo au plus. `post_type`
(facultatif, depuis la 1.1.1) est le type du contenu de destination : il signale en erreur
les blocs qui n'y sont pas utilisés (section 2). Réponse :

```json
{ "valid": false, "version": "1.2.0", "post_type": "post", "blocks": 12,
  "error_count": 1, "warning_count": 0, "truncated": false,
  "errors": [ { "block": "ufo-blocks/ufo-row", "path": "0.1", "message": "…" } ],
  "warnings": [] }
```

Au plus 200 erreurs et 200 avertissements sont détaillés ; au-delà, `truncated` vaut `true`
et `error_count` / `warning_count` donnent les totaux. `path` donne la position du bloc
(indices séparés par des points, à partir de 0).

Erreurs : bloc inconnu du site, bloc non utilisé dans ce type de contenu (avec `post_type`), bloc hors de son parent (`parent` / `ancestor`), attribut
non déclaré, type ou `enum` non respecté, ancien HTML statique dans un bloc `ufo-blocks/*`,
commentaire de bloc mal fermé. Avertissements : HTML libre hors bloc, bloc d'une autre
bibliothèque à vérifier dans l'éditeur. Rien n'est enregistré.

## 6. Sites en version antérieure à 1.1.0

Jusqu'à la 1.0.8, `ufo-grid`, `ufo-row`, `ufo-buttons-group`, `ufo-faq`, `ufo-faq-item` et
`ufo-tab` sont **statiques** : l'éditeur exige le HTML exact de leur `save()`, faute de quoi
le bloc s'affiche « contenu inattendu ou non valide ». Sur ces sites :

- copier le balisage d'un contenu existant du même site, sans le retoucher ;
- ne modifier que le texte des blocs du cœur à l'intérieur ;
- faire ouvrir la page dans l'éditeur avant publication.

## 7. Changements de balisage par version

| Version | Changement |
|---|---|
| 1.2.0 | Nouvelle grille insérée dans l'éditeur : `"equalRows":false` écrit explicitement (absent = `true`, inchangé). Blocs `ufo-heading-group`, `ufo-time-line` / `ufo-time-line-item` repris de `ufo-blocks`, rendus par le serveur : `date` et `title` passent du HTML (`<time>`, `<h3>`) au commentaire. Ancien HTML de `ufo-blocks` accepté et migré à la sauvegarde. Icônes ChartBar, ChartNoAxesCombined, Flame, Lightbulb, Target et chiffres Digit0 … Digit9. |
| 1.1.1 | `/check` accepte `post_type` : `ufo-grid` / `ufo-row` signalés dans un article. Balisage des blocs inchangé. |
| 1.1.0 | Rendu serveur de `ufo-grid`, `ufo-row`, `ufo-buttons-group`, `ufo-faq`, `ufo-faq-item`, `ufo-tab` : commentaire + enfants seulement. `ufo-faq-item.question` passe du HTML (`.faq-question`) au commentaire. Ancien format accepté et migré à la sauvegarde. Exemples dans les `block.json`, guide et routes `ufo-tools-blocks/v1`. |
| 1.0.5 | `ufo-faq-item` : bordure `border-slate-200` (au lieu de `border-gray-200`). Bloc `ufo-tabs` / `ufo-tab`. |
| 1.0.2 | `ufo-button` utilisable hors `ufo-buttons-group`. |
| 1.0.0 | Plugin renommé `ufo-tools-blocks` (successeur de `ufo-blocks` 1.8.0), noms de blocs inchangés. |
| ufo-blocks 1.6.0 | Nouveau balisage de `ufo-buttons-group` (`flex flex-col lg:flex-row …`). |
| ufo-blocks ≤ 1.7.0 | `ufo-faq-item` : question en `text-violet`. |
