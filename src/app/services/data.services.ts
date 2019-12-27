import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { urlData } from '../configs/configs';

@Injectable()
export class DataService {
 constructor(private http: HttpClient) {}

  httpOptions = {
    headers: new HttpHeaders({
      accept:  'application/json',
      'x-api-key': urlData.key,
    })
  };


  getFloorBlinds(floor) {
    const httpOptions = {
      headers: new HttpHeaders ({
       Authorization: urlData.key,
       accept: 'application/json'
      })
    };
    return this.http.get(`${urlData.baseUrl}/ext/window-blinds?floor=${floor}`, httpOptions);
  }

  getFloorBlinds2(floor) {
    const httpOptions = {
      headers: new HttpHeaders ({
       Authorization: urlData.key,
       accept: 'application/json'
      })
    };
    return this.http.get(`${urlData.baseUrl}/ext/v2/window-blinds?floor=${floor}`, httpOptions);
  }

  blindAction(id, state) {
    const httpOptions = {
      headers: new HttpHeaders ({
        Authorization: urlData.key,
        accept: 'application/json'
      })
    };
    const body = {
      bimBlindId: id,
      state
    };
    return this.http.post(`${urlData.baseUrl}/ext/window-blinds/control`, body, httpOptions);
  }

  checkBlindStatus(id) {
    const httpOptions = {
      headers: new HttpHeaders ({
        Authorization: urlData.key,
        accept: 'application/json'
      })
    };
    return this.http.get(`${urlData.baseUrl}/ext/window-blinds/control/:${id}`, httpOptions);
  }

  getFloorRooms(floor) {
    const httpOptions = {
      headers: new HttpHeaders ({
       Authorization: urlData.key,
       accept: 'application/json'
      })
    };
    return this.http.get(`${urlData.baseUrl}/ext/rooms?floor=${floor}`, httpOptions);
  }

  getFeedBack(floor, type) {
    const httpOptions = {
      headers: new HttpHeaders ({
       Authorization: urlData.key,
       accept: 'application/json'
      })
    };    
    return this.http.get(`${urlData.baseUrl}/ext/feedback?type=${type}&floor=${floor}`, httpOptions);
  }

}
