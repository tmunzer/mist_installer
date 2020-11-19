import requests
import json

from .orgs import Orgs
from .common import Common


class Sites(Common):

    def pull(self, body):
        body = self.get_body(body)
        if "host" in body and "headers" in body and "cookies" in body and "org_id" in body:
            sites = Orgs()._load_sites(body)
            if sites == "error":
                return {"status": 500, "data": "Unable to load Sites list"}
            else:
                if "role" in body and body["role"] == "admin":
                    sites = self._add_installer_setting(body, sites)
                return {"status": 200, "data": {"sites": sites}}
        else:
            return {"status": 500, "data": {"message": "Information missing"}}



    def _add_installer_setting(self, body, sites):
        installer_setting = Orgs().installer_setting(body)
        if installer_setting and "allow_all_sites" in installer_setting and installer_setting["allow_all_sites"] == True:
            for site in sites:
                site["installer"] = True
        elif installer_setting and "extra_site_ids" in installer_setting:
            for site in sites:
                if site["id"] in installer_setting["extra_site_ids"]:
                    site["installer"] = True
                else:
                    site["installer"] = False
        return sites

    def change_installer_access(self, body):
        body = self.get_body(body)
        if "org_id" in body and "site_id" in body and "enabled" in body:
            return Orgs()._update_org_installer(body, body["org_id"], body["site_id"], body["enabled"])
        else:
            return {"status": 500, "data": {"message": "org_id missing"}}
    
