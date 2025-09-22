# Pagemaster workspace

```bash

mkdir -p /repos/pagemaster
cd /repos/pagemaster
git clone git@gitlab.com:cadual/pagemaster/pagemaster-workspace.git
git clone git@gitlab.com:cadual/pagemaster/pagemaster-back.git
git clone git@gitlab.com:cadual/pagemaster/pagemaster-front.git
git clone git@gitlab.com:cadual/pagemaster/pagemaster-front-games.git
git clone git@gitlab.com:cadual/pagemaster/pagemaster-schemas.git
```

TODO :

- ✅currentPlayer and current gameInstance states
- ✅Player, Member GameMaster confusion
- ✅ESLint
- ✅Gestion du socket : 1ere etape simple : à chaque post / update sur game instance => notifier tout le monde pour qu'ils le récupère et se mette à jour
- ✅socket event types
- ✅formulaire pour ajouter des définitions et des items pour les inventaires
- ✅formulaire pour affecter des items au joueurs depuis la vue game master
- sécu : utiliser des schema pour validation des inputs + vérifier l'utilisateur qui update une game instance
- release v1 : documentation, readme, move github, move docker hub
- le formulaire en mode read only

- ameliorer les selecteurs
- Voir pour les animations 
- la gestion des assets
- transloco
- quelques TU
- gestion des erreurs : créer des classes au lieu des new Error()
