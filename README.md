# Mist Installer Web UI
 
This application provides a single page app for installers to claim new devices, assign them to a site/floorplan and set the first settings.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

<img src="https://github.com/tmunzer/mist_claim_web_ui/raw/main/._readme/img/claim.png"  width="50%"  />

## MIT LICENSE
 
Copyright (c) 2021 Thomas Munzer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the  Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## Features
- Retrieve and display Org and Site newly claimed devices 
- Claim new devices
- Edit newly claimed devices settings
- Assign newly claimed devices to Site/Floorplan

<img src="https://github.com/tmunzer/mist_claim_web_ui/raw/main/._readme/img/login.png"  width="45%"  />
<img src="https://github.com/tmunzer/mist_claim_web_ui/raw/main/._readme/img/edit.png" width="45%"  />


## Installation

This is a demo application using the Mist APIs.

You can run it as a strandalone Python application, or deploy it as a Docker container.

**Note**: The application is not providing secured HTTPS connections. It is highly recommended to deploy it behind a reverse proxy providing HTTPS encryption.


## Configuration
You can configure the settings through a configuration file or through Environment Variables.

### Configuration File
A configuration example with explanation is avaiable in the `django/backend/config_example.py`. This file must be edited and renamed `config.py`.

### Environment Variables
| Variable Name | Type | Default Value | Comment |
| ------------- | ---- | ------------- | ------- |
DJANGO_DEBUG | Number | 0 | Whether or not Django starts in Debug Mode (0=Production, 1=Debug) |
DJANGO_ALLOWED_HOSTS | String |  | FQDN on which Django is listening. Only used in Production Mode |
GOOGLE_API_KEY | String | | Google API Key to use [Google Map Javascript API](https://developers.google.com/maps/gmp-get-started) |
