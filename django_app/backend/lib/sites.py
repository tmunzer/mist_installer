import requests
import json

from .common import Common

class Sites(Common):

    def pull(self, body):
        body = self.get_body(body)    
        if "host" in body and "headers" in body and "cookies" in body and "org_id" in body:
            try: 
                url = "https://{0}/api/v1/installer/orgs/{1}/sites".format(body["host"], body["org_id"])
                resp = requests.get(url, headers=body["headers"], cookies=body["cookies"])                
                return {"status": 200, "data": {"sites": resp.json()}}
            except:
                return {"status": 500, "data": {"message": "unable to retrieve the Sites list"}}
        else:
            return {"status":500, "data":{"message": "Information missing"}}