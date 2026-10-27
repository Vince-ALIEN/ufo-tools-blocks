#!/usr/bin/env bash
# Zip à soumettre sur WordPress.org : le contenu du zip GitHub (.distignore),
# sans l'updater GitHub ni l'en-tête « Update URI », interdits sur
# WordPress.org (les mises à jour y passent par le répertoire).
#
# Usage : npm run plugin-zip:wporg  →  ufo-tools-blocks-wporg.zip
set -euo pipefail

cd "$(dirname "$0")/.."
slug=ufo-tools-blocks
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT

npm run build

rsync -a --exclude-from=.distignore \
	--exclude='includes/class-ufo-tools-blocks-updater.php' \
	./ "$stage/$slug/"

main="$stage/$slug/$slug.php"
sed -i.bak '/^ \* Update URI:/d' "$main" && rm "$main.bak"

if grep -q 'Update URI' "$main" || [ -e "$stage/$slug/includes/class-ufo-tools-blocks-updater.php" ]; then
	echo "Updater encore présent dans le zip WordPress.org" >&2
	exit 1
fi

rm -f "$slug-wporg.zip"
(cd "$stage" && zip -qr - "$slug") > "$slug-wporg.zip"
echo "$slug-wporg.zip"
