#!/bin/bash

cd src_angular/
ng build --deploy-url static/
cp dist/claim/* ../django_app/claim/static
cp dist/claim/index.html ../django_app/claim/templates
cd ..
