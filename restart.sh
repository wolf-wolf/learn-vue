rm -rf ./js
rm -rf ./dist
tsc --build tsconfig.json
parcel index.html
