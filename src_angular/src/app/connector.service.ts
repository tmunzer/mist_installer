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
  private siteNameSource = new BehaviorSubject("");
  private googleApiKey = new BehaviorSubject("");

  headers = this.headersSource.asObservable();
  host = this.hostSource.asObservable();
  cookies = this.cookiesSource.asObservable();
  self = this.selfSource.asObservable();
  org_id = this.orgIdSource.asObservable();
  site_name = this.siteNameSource.asObservable();
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
  siteNameSet(data:string){
    this.siteNameSource.next(data)
  }
  googleApiKeySet(data:string){
    this.googleApiKey.next(data)
  }
}
