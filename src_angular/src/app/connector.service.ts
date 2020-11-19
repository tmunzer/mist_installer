import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  private headersSource = new BehaviorSubject({});
  private cookiesSource = new BehaviorSubject({});
  private hostSource = new BehaviorSubject('');
  private selfSource = new BehaviorSubject({});
  private orgIdSource = new BehaviorSubject("");
  private sitesSource = new BehaviorSubject([])
  private siteNameSource = new BehaviorSubject("");
  private roleSource = new BehaviorSubject("");
  private orgModeSource = new BehaviorSubject(false);
  private googleApiKey = new BehaviorSubject("");

  headers = this.headersSource.asObservable();
  host = this.hostSource.asObservable();
  cookies = this.cookiesSource.asObservable();
  self = this.selfSource.asObservable();
  org_id = this.orgIdSource.asObservable();
  sites = this.sitesSource.asObservable();
  site_name = this.siteNameSource.asObservable();
  role = this.roleSource.asObservable();
  orgMode = this.orgModeSource.asObservable();
  google_api_key = this.googleApiKey.asObservable();

  constructor() { }

  headersSet(data: {}) {
    this.headersSource.next(data)
  }
  cookiesSet(data: {}) {
    this.cookiesSource.next(data)
  }
  hostSet(data: string) {
    this.hostSource.next(data)
  }
  selfSet(data: {}) {
    this.selfSource.next(data)
  }
  orgIdSet(data: string){
    this.orgIdSource.next(data)
  }
  sitesSet(data:any[]){
    this.sitesSource.next(data)
  }
  siteNameSet(data:string){
    this.siteNameSource.next(data)
  }
  roleSet(data:string){
    this.roleSource.next(data)
  }
  orgModeSet(data:boolean){
    this.orgModeSource.next(data)
  }
  googleApiKeySet(data:string){
    this.googleApiKey.next(data)
  }
}
