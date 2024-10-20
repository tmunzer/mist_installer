
import requests
import json
from .common import Common


class Devices(Common):

#############
# get Inventory from Cloud
#############
    def pull_inventory(self, body):
        body = self.get_body(body)
        if not "org_id" in body:
            return {"status": 500, "data": {"message": "site_id or org_id missing"}}
        else:
            return self._pull_inventory(body)

    def _pull_inventory(self, body):
        try:
            extract = self.extractAuth(body)
            limit = 1000
            page = 1
            results = []
            total = 1
            while len(results) < int(total) and int(page) < 50:
                if "type" in body and body["type"]:
                    device_type = body["type"]
                else:
                    device_type = "all"
                
                url = "https://{0}/api/v1/installer/orgs/{1}/devices?type={2}&limit={3}&page={4}".format(
                    extract["host"], body["org_id"],device_type, limit, page)
                resp = requests.get(
                    url, headers=extract["headers"], cookies=extract["cookies"])
                results.extend(resp.json())
                total = resp.headers["X-Page-Total"]
                page += 1
            return {"status": 200, "data": {"total": total, "results": results}}
        except:
            return {"status": 500, "data": {"message": "Unable to retrieve the inventory"}}


#############
# Claim devices to the inventory
#############
    def claim_devices(self, body):
        body = self.get_body(body)
        if not "org_id" in body:
            return {"status": 500, "data": {"message": "org_id is missing"}}
        elif not "claim_codes" in body:
            return {"status": 500, "data": {"message": "claim_codes is missing"}}
        else:
            return self._claim_inventory(body)

    def _claim_inventory(self, body):
        extract = self.extractAuth(body)
        try:
            url = "https://{0}/api/v1/installer/orgs/{1}/devices".format(
                body["host"], body["org_id"])
            resp = requests.post(
                url, headers=extract["headers"], cookies=extract["cookies"], json=body["claim_codes"])
            if "site_name" in body:
                data = resp.json()                    
                self._assign_device(
                    body, data["inventory_added"], extract)
            return {"status": 200, "data": {"results": resp.json()}}
        except:
            return {"status": 500, "data": {"message": "Unable to claim the devices"}}

    def _assign_device(self, body, devices, extract):
        data = {
            "site_name": body["site_name"]
        }
        if "map_id" in body:
            data["map_id"] = body["map_id"]
        for device in devices:
            try:
                url = "https://{0}/api/v1/installer/orgs/{1}/devices/{2}".format(
                    body["host"], body["org_id"], device["mac"])
                resp = requests.put(
                    url, headers=extract["headers"], cookies=extract["cookies"], json=data)
            except:
                print("ERROR: unable to assign device {0}".format(
                    device["mac"]))


#############
# Unclaim device from the inventory
#############
    def unclaim_device(self, body):
        body = self.get_body(body)
        if not "org_id" in body:
            return {"status": 500, "data": {"message": "org_id is missing"}}
        elif not "device_mac" in body:
            return {"status": 500, "data": {"message": "device_mac is missing"}}
        else:
            return self._unclaim_inventory(body)

    def _unclaim_inventory(self, body):
        extract = self.extractAuth(body)
        try:
            url = "https://{0}/api/v1/installer/orgs/{1}/devices/{2}".format(
                body["host"], body["org_id"], body["device_mac"])
            resp = requests.delete(
                url, headers=extract["headers"], cookies=extract["cookies"])
            return {"status": 200, "data": {"result": resp.json()}}
        except:
            return {"status": 500, "data": {"message": "unable to unclaim the device"}}

#############
# Provision device from the inventory
#############
    def provision_device(self, body):
        body = self.get_body(body)
        if not "org_id" in body:
            return {"status": 500, "data": {"message": "org_id is missing"}}
        elif not "device" in body:
            return {"status": 500, "data": {"message": "device is missing"}}
        elif not "device_mac" in body:
            return {"status": 500, "data": {"message": "device_mac is missing"}}
        else:
            return self._provision_device(body)

    def _provision_device(self, body):
        extract = self.extractAuth(body)        
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


#############
# Locate/Unlocate a device
#############
    def locate(self, body):
        body = self.get_body(body)
        if not "org_id" in body:
            return {"status": 500, "data": {"message": "org_id missing"}}
        elif not "device_mac" in body:
            return {"status": 500, "data": {"message": "device_mac is missing"}}
        else:
            return self._locate(body)

    def _locate(self, body):
        extract = self.extractAuth(body)
        try:
            url = "https://{0}/api/v1/installer/orgs/{1}/devices/{2}/locate".format(
                body["host"], body["org_id"], body["device_mac"])
            resp = requests.post(
                url, headers=extract["headers"], cookies=extract["cookies"])
            return {"status": 200, "data": {"result": resp.json()}}
        except:
            return {"status": 500, "data": {"message": "unable to provision the device"}}

    def unlocate(self, body):
        body = self.get_body(body)
        if not "org_id" in body:
            return {"status": 500, "data": {"message": "org_id missing"}}
        elif not "device_mac" in body:
            return {"status": 500, "data": {"message": "device_mac is missing"}}
        else:
            return self._unlocate(body)

    def _unlocate(self, body):
        extract = self.extractAuth(body)
        try:
            url = "https://{0}/api/v1/installer/orgs/{1}/devices/{2}/unlocate".format(
                body["host"], body["org_id"], body["device_mac"])
            resp = requests.post(
                url, headers=extract["headers"], cookies=extract["cookies"])
            return {"status": 200, "data": {"result": resp.json()}}
        except:
            return {"status": 500, "data": {"message": "unable to provision the device"}}
