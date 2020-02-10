import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { urlData } from '../configs/configs';

@Injectable()
export class DataService {
 constructor(private http: HttpClient) {}

  httpOptions = {
    headers: new HttpHeaders({
      accept:  'application/json',
      Authorization: urlData.key,
      'x-api-key': urlData.key,
    })
  };

  getFloorBlinds(floor: string) {
    return this.http.get(`${urlData.baseUrl}/ext/window-blinds?floor=${floor}`, this.httpOptions);
  }

  getFloorBlinds2(floor: string) {
    return this.http.get(`${urlData.baseUrl}/ext/v2/window-blinds?floor=${floor}`, this.httpOptions);
  }

  blindAction(id: string, state: string) {
    const body = {
      bimBlindId: id,
      state
    };
    return this.http.post(`${urlData.baseUrl}/ext/v2/window-blinds/control`, body, this.httpOptions);
  }

  checkBlindStatus(id: string) {
    return this.http.get(`${urlData.baseUrl}/ext/window-blinds/control/:${id}`, this.httpOptions);
  }

  getFloorRooms(floor: string) {
    return this.http.get(`${urlData.baseUrl}/ext/rooms?floor=${floor}`, this.httpOptions);
  }

  getFeedBack(floor: string, type: string) {
    return this.http.get(`${urlData.baseUrl}/ext/feedback?type=${type}&floor=${floor}`, this.httpOptions);
  }
}
