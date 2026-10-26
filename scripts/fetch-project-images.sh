#!/usr/bin/env bash
# scripts/fetch-project-images.sh
# Downloads placeholder images for the portfolio seed into
# public/images/projects/. Idempotent: skips files that already exist.

set -euo pipefail

DEST="public/images/projects"
mkdir -p "$DEST"

# Each entry: <output-filename-base> <unsplash-search-query>
# The script appends a random seed to avoid caching the same image
# on repeat runs, and downloads at 1600x900.

declare -a IMAGES=(
  # Kenya / tourism
  "tour-kenya-ntsp        kenya,safari,landscape"
  "tour-kenya-ntsp-1      maasai,mara,elephant"
  "tour-kenya-ntsp-2      amboseli,kilimanjaro"
  "tour-kenya-ntsp-3      kenya,coast,beach"

  # Eldoret / municipal
  "eldoret-city-portal    city,africa,aerial"
  "eldoret-city-portal-1  municipal,building,architecture"
  "eldoret-city-portal-2  public,space,urban"

  # Baridi / brand
  "baridi-brand-identity  brand,identity,packaging"
  "baridi-brand-identity-1  minimal,product,mockup"
  "baridi-brand-identity-2  stationery,design,branding"
  "baridi-brand-identity-3  ecommerce,product,flatlay"

  # Wilcom / corporate
  "wilcom-corporate-site  engineering,construction,site"
  "wilcom-corporate-site-1  architecture,corporate,office"

  # Sarova / hospitality
  "sarova-digital-campaign  hotel,luxury,interior"
  "sarova-digital-campaign-1  resort,pool,hospitality"
  "sarova-digital-campaign-2  hospitality,campaign,print"

  # Java House / mobile app
  "java-house-loyalty-redesign  mobile,app,ui"
  "java-house-loyalty-redesign-1  coffee,shop,interior"

  # KBL / packaging
  "kenya-breweries-brand-refresh  beverage,packaging,design"

  # Nakumatt / archive
  "nakumatt-legacy-brand-archive  retail,store,archive"

  # Kigali Coffee / ecommerce
  "kigali-coffee-ecommerce  coffee,beans,packaging"

  # Strathmore / wayfinding
  "strathmore-student-hub-signage  wayfinding,signage,interior"
  "strathmore-student-hub-signage-1  university,library,modern"
  "strathmore-student-hub-signage-2  signage,environmental,design"

  # Greenspoon / campaign
  "greenspoon-farm-to-table  farm,fresh,produce"
  "greenspoon-farm-to-table-1  food,campaign,photography"
  "greenspoon-farm-to-table-2  organic,vegetables,farm"

  # Craft Labs / design system
  "craft-labs-design-system  design,system,ui"
)

download() {
  local filename="$1"
  local query="$2"
  local out="$DEST/${filename}.jpg"

  if [[ -f "$out" ]]; then
    echo "  ↳ skip (exists): $filename.jpg"
    return
  fi

  # Add a numeric suffix to bust caches between runs
  local seed=$(( RANDOM % 10000 ))
  local url="https://source.unsplash.com/1600x900/?${query}&sig=${seed}"

  echo "  ↓ $filename.jpg ($query)"
  for attempt in 1 2 3; do
    if curl -fsSL --max-time 30 "$url" -o "$out"; then
      # Verify it's a real JPEG (some errors return HTML)
      if file "$out" | grep -qi "JPEG"; then
        return
      else
        rm -f "$out"
      fi
    fi
    echo "    retry $attempt…"
    sleep 2
  done
  echo "    ⚠ failed after 3 attempts: $filename"
}

echo "Fetching project images into $DEST …"
for entry in "${IMAGES[@]}"; do
  read -r name query <<< "$entry"
  download "$name" "$query"
done
echo "Done."