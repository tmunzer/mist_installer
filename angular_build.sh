#!/bin/bash

cd src_angular/
ng build --deploy-url static/
cp dist/psk/* ../django_app/claim/static
cp dist/psk/index.html ../django_app/claim/templates
cd ..
