from django.shortcuts import render
import requests
import json
from django.http import JsonResponse, HttpResponse, Http404
import json
from django.views.decorators.csrf import csrf_exempt
import json
import time
import ast
import os
from .lib.devices import Devices
from .lib.sites import Sites
from .lib.maps import Maps

try:
    from .config import google_api_key
except:
    google_api_key = os.environ.get("GOOGLE_API_KEY", default="")

try:
    from .config import app_disclaimer
except:
    app_disclaimer = os.environ.get("APP_DISCLAIMER", default="")

try:
    from .config import app_github_url
except:
    app_github_url = os.environ.get("APP_GITHUB_URL", default="")

try:
    from .config import app_docker_url
except:
    app_docker_url = os.environ.get("APP_DOCKER_URL", default="")
try:
    from .config import google_api_key
except:
    import os
    google_api_key = os.environ.get("GOOGLE_API_KEY", default="")

try:
    from .config import mist_hosts
except:
    mist_hosts = ast.literal_eval(os.environ.get("MIST_HOSTS", default='{"Global 01 - manage.mist.com": "api.mist.com", "Global 02 - manage.gc1.mist.com": "api.gc1.mist.com", "Global 03 - manage.ac2.mist.com": "api.ac2.mist.com","Global 04 - manage.gc2.mist.com": "api.gc2.mist.com", "Europe 01 - manage.eu.mist.com": "api.eu.mist.com"}'))

##########
# Devices
@csrf_exempt
def pull_inventory(request):
    if request.method == "POST":
        response = Devices().pull_inventory(request.body)
        return JsonResponse(status=response["status"], data=response["data"])
    else:
        return Http404


@csrf_exempt
def claim_devices(request):
    if request.method == "POST":
        response = Devices().claim_devices(request.body)
        return JsonResponse(status=response["status"], data=response["data"])
    else:
        return Http404


@csrf_exempt
def unclaim_device(request):
    if request.method == "POST":
        response = Devices().unclaim_device(request.body)
        return JsonResponse(status=response["status"], data=response["data"])
    else:
        return Http404


@csrf_exempt
def provision_device(request):
    if request.method == "POST":
        response = Devices().provision_device(request.body)
        return JsonResponse(status=response["status"], data=response["data"])
    else:
        return Http404


@csrf_exempt
def locate(request):
    if request.method == "POST":
        response = Devices().locate(request.body)
        return JsonResponse(status=response["status"], data=response["data"])
    else:
        return Http404


@csrf_exempt
def unlocate(request):
    if request.method == "POST":
        response = Devices().unlocate(request.body)
        return JsonResponse(status=response["status"], data=response["data"])
    else:
        return Http404

##########
# Sites


@csrf_exempt
def sites(request):
    if request.method == 'POST':
        response = Sites().pull(request.body)
        return JsonResponse(status=response["status"], data=response["data"])
    else:
        return Http404

@csrf_exempt
def changeInstaller(request):
    if request.method == "POST":
        response = Sites().change_installer_access(request.body)
        print(response)
        return JsonResponse(status=response["status"], data=response["data"])
    else:
        return Http404

##########
# Maps


@csrf_exempt
def maps(request):
    if request.method == 'POST':
        response = Maps().pull(request.body)
        return JsonResponse(status=response["status"], data=response["data"])
    else:
        return Http404


##########
# LOGIN


def _get_self(request, host, method, headers={}, cookies=None):
    if cookies == None:
        cookies_dict = None
    else:
        cookies_dict = cookies.get_dict()
    url = "https://%s/api/v1/self" % (host)
    resp = requests.get(url, headers=headers, cookies=cookies)
    data = resp.json()
    return JsonResponse({"host": host, "data": data, "method": method, "headers": headers, "cookies":  cookies_dict})


@csrf_exempt
def login(request):
    if request.method == 'POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        if "host" in body:

            if "token" in body:
                headers = {"Authorization": "Token " +
                           body["token"], 'Content-Type': "application/json"}
                return _get_self(request, body["host"], "token", headers=headers)

            elif "email" in body and "password" in body:
                url = "https://%s/api/v1/login" % (body["host"])
                data = {"email": body["email"], "password": body["password"]}
                if "two_factor" in body:
                    data["two_factor"] = body["two_factor"]
                headers = {'Content-Type': "application/json"}
                resp = requests.post(url, json=data, headers={})

                if resp.status_code == 200:
                    cookies = resp.cookies
                    return _get_self(request, body["host"], "username", headers=headers, cookies=cookies)
                else:
                    return JsonResponse(status=400, data={"message": "authentication failed"})
            elif "email" in body:
                return JsonResponse(status=401, data={"message": "authentication information are missing"})
            elif "password" in body:
                return JsonResponse(status=401, data={"message": "authentication information are missing"})
            else:
                return JsonResponse(status=500, data={"message": "authentication information are missing"})
        else:
            return JsonResponse(status=500, data={"message": "host missing"})
    else:
        return JsonResponse(status=400, data={"message": "not allowed"})

# ##########
# # EMAIL


# @csrf_exempt
# def emailPsk(request):
#     if request.method == 'POST':
#         body_unicode = request.body.decode("utf-8")
#         body = json.loads(body_unicode)
#         if "name" in body and "user_email" in body and "ssid" in body and "psk" in body:
#             resp = mist_smtp.send_psk(
#                 body["psk"], body["ssid"], body["name"], body["user_email"])
#             return JsonResponse({"result": resp})
#         else:
#             return JsonResponse(status=500, data={"message": "missing parametesr"})

def gap(request):
    if request.method == "GET":
        return JsonResponse({"gap": google_api_key})


def script(request):
    if request.method == "GET":
        data = """
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key={0}&callback=initMap';
script.defer = true;

window.initMap = function() {{
}};

// Append the 'script' element to 'head'
document.head.appendChild(script);
        """.format(google_api_key)
        return HttpResponse(data, content_type="application/javascript")


def disclaimer(request):
    if request.method == "GET":
        return JsonResponse({
            "disclaimer": app_disclaimer,
            "github_url": app_github_url,
            "docker_url": app_docker_url
        })

def hosts(request):
    if request.method == "GET":
        data = []
        for key in mist_hosts:
            data.append({"value": mist_hosts[key], "viewValue": key})
        data = sorted(data, key=lambda x: x["viewValue"])
        return HttpResponse(json.dumps(data))
