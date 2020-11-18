
import requests
import json
from .common import Common


class Devices(Common):

    #############
    # get Inventory from Cloud
    #############
    def pull_inventory(self, body):
        body = self.get_body(body)
        if "org_id" in body:
            return self._pull_inventory(body)
        else:
            return {"status": 500, "data": {"message": "site_id or org_id missing"}}

    def _pull_inventory(self, body):
        try:
            extract = self.extractAuth(body)
            if "full" in body and body["full"]:
                limit = 1000
                page = 1
                results = []
                total = 1
                while len(results) < int(total) and int(page) < 50:
                    url = "https://{0}/api/v1/installer/orgs/{1}/devices?limit={2}&page={3}".format(
                        extract["host"], body["org_id"], limit, page)
                    resp = requests.get(
                        url, headers=extract["headers"], cookies=extract["cookies"])
                    if "type" in body and body["type"]:
                        url += "&type={0}".format(body["type"])
                    results.extend(resp.json())
                    total = resp.headers["X-Page-Total"]
                    page += 1
                return {"status": 200, "data": {"total": total, "results": results}}

            else:
                limit = body["limit"] if "limit" in body else 100
                page = body["page"] + 1 if "page" in body else 1
                url = "https://{0}/api/v1/installer/orgs/{1}/devices?limit={2}&page={3}".format(
                    extract["host"], body["org_id"], limit, page)
                if "type" in body and body["type"]:
                    url += "&type={0}".format(body["type"])
                resp = requests.get(
                    url, headers=extract["headers"], cookies=extract["cookies"])
                return {"status": 200, "data": {"page": resp.headers["X-Page-Page"], "limit": resp.headers["X-Page-limit"], "total": resp.headers["X-Page-Total"], "results": resp.json()}}
        except:
            return {"status": 500, "data": {"message": "Unable to retrieve the inventory"}}


#############
# Claim devices to the inventory
#############

    def claim_devices(self, body):
        body = self.get_body(body)
        if "org_id" in body:
            return self._claim_inventory(body)
        else:
            return {"status": 500, "data": {"message": "site_id or org_id missing"}}

    def _claim_inventory(self, body):
        extract = self.extractAuth(body)
        if "claim_codes" in body:
            try:
                url = "https://{0}/api/v1/installer/orgs/{1}/devices".format(
                    body["host"], body["org_id"])
                print(url)
                resp = requests.post(
                    url, headers=extract["headers"], cookies=extract["cookies"], json=body["claim_codes"])
                print(resp)
                if "site_name" in body:
                    data = resp.json()                    
                    self._assign_device(
                        body, data["inventory_added"], extract)
                return {"status": 200, "data": {"results": resp.json()}}
            except:
                return {"status": 500, "data": {"message": "Unable to claim the devices"}}
        else:
            return {"status": 500, "data": {"message": "claim_codes missing"}}

    def _assign_device(self, body, devices, extract):
        print(devices)
        data = {
            "site_name": body["site_name"]
        }
        if "map_id" in body:
            data["map_id"] = body["map_id"]
        for device in devices:
            try:
                url = "https://{0}/api/v1/installer/orgs/{1}/devices/{2}".format(
                    body["host"], body["org_id"], device["mac"])
                print(url)
                resp = requests.put(
                    url, headers=extract["headers"], cookies=extract["cookies"], json=data)
                print(resp)

            except:
                print("ERROR: unable to assign device {0}".format(
                    device["mac"]))


#############
# Unclaim device from the inventory
#############


    def unclaim_device(self, body):
        body = self.get_body(body)
        if "org_id" in body:
            return self._unclaim_inventory(body)
        else:
            return {"status": 500, "data": {"message": "site_id or org_id missing"}}

    def _unclaim_inventory(self, body):
        extract = self.extractAuth(body)
        print(extract)
        print(body)
        if "device_mac" in body:
            try:
                url = "https://{0}/api/v1/installer/orgs/{1}/devices/{2}".format(
                    body["host"], body["org_id"], body["device_mac"])
                print(url)
                resp = requests.delete(
                    url, headers=extract["headers"], cookies=extract["cookies"])
                print(resp)
                return {"status": 200, "data": {"result": resp.json()}}
            except:
                return {"status": 500, "data": {"message": "unable to unclaim the device"}}
        else:
            return {"status": 500, "data": {"message": "device_mac missing"}}

#############
# Provision device from the inventory
#############
    def provision_device(self, body):
        body = self.get_body(body)
        if "org_id" in body:
            return self._provision_device(body)
        else:
            return {"status": 500, "data": {"message": "site_id or org_id missing"}}

    def _provision_device(self, body):
        extract = self.extractAuth(body)
        if "device" in body and "device_mac" in body:
            data = {}
            for key in body["device"]:
                if body["device"][key]:
                    data[key]=body["device"][key]
                elif key != "site_id":
                    data[key]=""
            try:
                url = "https://{0}/api/v1/installer/orgs/{1}/devices/{2}".format(
                    body["host"], body["org_id"], body["device_mac"])
                resp = requests.put(
                    url, headers=extract["headers"], cookies=extract["cookies"], json=data)
                return {"status": 200, "data": {"result": resp.json()}}
            except:
                return {"status": 500, "data": {"message": "unable to provision the device"}}
        else:
            return {"status": 500, "data": {"message": "device or device_mac missing"}}


#############
# Locate/Unlocate a device
#############
    def locate(self, body):
        body = self.get_body(body)
        if "org_id" in body:
            return self._locate(body)
        else:
            return {"status": 500, "data": {"message": "org_id missing"}}

    def _locate(self, body):
        extract = self.extractAuth(body)
        if "device_mac" in body:
            #try:
            url = "https://{0}/api/v1/installer/orgs/{1}/devices/{2}/locate".format(
                body["host"], body["org_id"], body["device_mac"])
            resp = requests.post(
                url, headers=extract["headers"], cookies=extract["cookies"])
            return {"status": 200, "data": {"result": resp.json()}}
            #except:
            #    return {"status": 500, "data": {"message": "unable to provision the device"}}
        else:
            return {"status": 500, "data": {"message": "device_mac missing"}}

    def unlocate(self, body):
        body = self.get_body(body)
        if "org_id" in body:
            return self._locate(body)
        else:
            return {"status": 500, "data": {"message": "org_id missing"}}

    def _unlocate(self, body):
        extract = self.extractAuth(body)
        if "device_mac" in body:
            #try:
            url = "https://{0}/api/v1/installer/orgs/{1}/devices/{2}/unlocate".format(
                body["host"], body["org_id"], body["device_mac"])
            resp = requests.post(
                url, headers=extract["headers"], cookies=extract["cookies"])
            return {"status": 200, "data": {"result": resp.json()}}
            #except:
            #    return {"status": 500, "data": {"message": "unable to provision the device"}}
        else:
            return {"status": 500, "data": {"message": "device_mac missing"}}
