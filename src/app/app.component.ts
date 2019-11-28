import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { DataService } from './services/data.services';
import { urlData }from './configs/configs';

interface Coord {
  left: number;
  top: number;
  type?: string;
}

interface HighLightObj {
  id: string;
  area: string;
  color: string;
}

interface ParamsObj {
  floor?: string;
  center?: Coord;
  position?: Coord;
  key?: string;
  version?: string;
  zoom?: string;
  v?: string;
  mode?: string;
  type?: string;
}

interface ClickedArea {
  zone: string;
  room: string;
}
interface BlindsObj {
  [key: string]: string[] | string;
  x: string;
  y: string;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DataService]
})
export class AppComponent implements OnInit {
  floors: string[] = ['1', '2', '3', '4', '5', '6', '7', '-1', '-2', '-3'];
  floor = '1';
  objectToHighlight: HighLightObj | undefined ;
  position: Coord;
  blindObj: BlindsObj;
  zoom = 5;
  inputPosition: string;
  objectToZoom;
  apiKey: string;
  center: Coord;
  v: string;
  inputIdRoom = '04-X11-C';
  inputIdZone = '04-X11-C';
  inputColor = '#4000ff';
  inputArea = 'rooms';
  paramToShow = 'roomNumber';
  version = 'white';
  inputCoordParam = 'CMX';
  x = 184.41725;
  y = 67.89225;
  hostBlinds: any;
  hostRooms: any;
  hostRoomsWithNegativeFB: any;
  blindSuccessObj;
  ws;
  wsChanges;
  mode = 'application';
  wsAttemptsCounter = 0;

  constructor(
    private ref: ChangeDetectorRef,
    private dataService: DataService) {}

  // parse params from URL
  paramsParser(query: string): ParamsObj {
    const paramPairsArr = query.split('&');
    const paramsObj: any = {};

    paramPairsArr.forEach(pair => {
    const splitedPair = pair.split('=');
    let value: any = {};
    switch (splitedPair[0]) {
      case 'position':
      case 'center':
        const valArr = splitedPair[1].split(',');
        value.top = +valArr[1];
        value.left = +valArr[0];
        break;
      default:
        value = splitedPair[1];
    }
    paramsObj[splitedPair[0]] = value;
    });
    return paramsObj;
  }

  //for zoom
  counter(counter: number): void {
    this.zoom = this.zoom + counter;
  }

  //highLight obj 
  highLight(): void {
    const id = this.inputArea === 'zones' ? this.inputIdZone : this.inputIdRoom;
    this.objectToHighlight = {
      id, //string
      area: this.inputArea, //string
      color: this.inputColor //string
    };
  }

  //zoom on click
  zoomInOut(): void {
    const id = this.inputArea === 'zones' ? this.inputIdZone : this.inputIdRoom;
    this.objectToZoom = {
      id, //string
      area: this.inputArea, //string
      zoom: this.zoom // number
    };
    console.log(' -- objectToZoom', this.objectToZoom);
  }

  // change floor on click
  changeFloor(floor: string): void {
    this.floor = floor; //string
    if (this.mode === 'application') { 
      // some action     
    } else if (this.mode === 'mobile') {
      if (this.ws) this.ws.close();
      this.wsFunc(this.floor)
      this.getFloorBlindsFromServerInHost(this.floor);
      this.getFloorRoomsFromServerInHost(this.floor);
    } else {
      console.log(' -- Error: Unknown mode', this.mode);
    }
    this.inputIdZone = '';
    this.inputIdRoom = '';
    this.paramToShow = 'roomNumber';
    console.log(' -- NEW FLOOR: ', this.floor);
  }

  getCurrentCell(obj: ClickedArea): void {
    this.inputIdZone = obj.zone;
    this.inputIdRoom = obj.room;
    console.log('%c --catch in host ', 'background: #ffff4d; color: black', obj);
    this.ref.detectChanges();
  }

  getBlindInfo(blindsObj: any): void {
    this.blindObj = blindsObj;
    console.log('%c --catch in host blinds ', 'background: #ffff4d; color: black', this.blindObj);
    if (this.mode === 'mobile') {
      this.getBlindsObj(blindsObj);      
    } 
  }

  showPosition(): void {
    if (this.x && this.y) {
      this.position = {top: +this.y, left: +this.x, type: this.inputCoordParam};
    } else {
      console.log('PLEASE, CHECK POSITION FIELD');
    }
  }

  switcher(paramToShow: string): void {
    this.paramToShow = paramToShow;
    if (paramToShow === 'negativeFB' && this.mode === 'mobile') {
      this.getNegativeFB();
    }
  }

  getFloorRoomsFromServerInHost(floor: string): void {
    this.dataService.getFloorRooms(floor)
    .subscribe(
      data => {
        this.hostRooms = data;
        console.log(`%c[--serverRoomsHost] - ${this.hostRooms.length}`, 'background: #0000cc; color: white');
      },
      error => {
        console.log('ERROR in get floor rooms--', error.message);
        this.hostRooms = [];
        console.log(`%c[--serverRoomsHost] - ${this.hostRooms.length}`, 'background: #0000cc; color: white');
      });
  }

  getNegativeFB(): void {
    this.dataService.getFeedBack(this.floor, 'negative')
      .subscribe(
        data => {
          const dataWrench = data;
          (dataWrench as any).forEach(fbRoom => {
            if (fbRoom.bimRoomId) { return; }
            const roomApi = this.hostRooms.find(item => item.logicalRoomId === fbRoom.roomId);
            if (roomApi) {
              fbRoom.bimRoomId = roomApi.bimRoomId;
            }
          });
          this.hostRoomsWithNegativeFB = dataWrench;
          console.log(`%c[--serverNegativeFBHost] - ${this.hostRoomsWithNegativeFB.length}`, 'background: #0000cc; color: white');
        },
        error => console.log('ERROR', error.message)
      );
  }

  getFloorBlindsFromServerInHost(floor: string) :void{
    this.dataService.getFloorBlinds(floor)
    .subscribe(
      data => {
        this.hostBlinds = data;
        console.log(`%c[--serverBlindsHost] - ${this.hostBlinds.length}`, 'background: #0000cc; color: white');
      },
      error => console.log(' -- ERROR', error.message)
      );
  }

  getBlindsObj(blindsObj: BlindsObj): void {
    let action: string;
    if (blindsObj.hasOwnProperty('close')) { action = 'close'; }
    if (blindsObj.hasOwnProperty('open')) { action = 'open'; }
    const blindsArr = (blindsObj[action] as []);
    const answersArr = [];
    let queryCounter = 0;
    const qeries = blindsArr.length;

    const apiAction = action === 'open' ? 'open' : 'closed';
    blindsArr.forEach(id => {
      console.log('*** post to serverHOST, blind:', (id as any).bimBlindId, apiAction);
      const blindObj = {blindsArr, apiAction};
      this.dataService.blindAction((id as any).bimBlindId, apiAction)
      .subscribe(
        data => {
          console.log('[response postHOST]', data);
          const correlationId = (data as any).correlationId;
          let counter = 0;

          const timer = setInterval(() => {

            this.dataService.checkBlindStatus(correlationId)
            .subscribe(
              data => {

                counter++;
                // console.log('request counter - from 3', counter);
                console.log('[response confirm get in HOST]', data);

                if ((data as any).status === 'SUCCESS') {
                  queryCounter++;
                  clearInterval(timer);
                  answersArr.push('success');
                  console.log('%c BLIND_HOST - ACTION DONE', 'background: #0000cc; color: white');
                } else if ((data as any).status === 'FAILED') {
                  queryCounter++;
                  clearInterval(timer);
                  console.log('%c BLIND_HOST - ACTION FAILED', 'background: #0000cc; color: white');
                  answersArr.push('failed');
                } else {
                  if (counter > 5) {
                    queryCounter++;
                    console.log('%c BLIND_HOST - ACTION ERROR: too much attempts', 'background: #0000cc; color: white');
                    clearInterval(timer);
                    answersArr.push('timeOut');
                  }
                }
                if (queryCounter === qeries) {
                  const statusFailed = answersArr.some(item => item === 'failed');
                  if (statusFailed) {
                    this.blindSuccessObj = Object.assign({}, blindObj, {status: false, disabled: true});
                    console.log(this.blindSuccessObj);
                  } else {
                    const status = !answersArr.some(item => item === 'timeOut');
                    this.blindSuccessObj = Object.assign({}, blindObj, {status});
                    console.log(this.blindSuccessObj);
                  }
                }                                
              },
              error => {
                console.log('--ERROR in blind action  confirm get', error.message);
              }
            );
          }, 3000);
        },
        error => {
          console.log('--ERROR in blind action post', error.message);
          this.blindSuccessObj = Object.assign({}, blindObj, {status: false, disabled: true});
        });
    });
  }

  wsFunc(floor: string) {
    const that = this;
    const filter = encodeURIComponent(JSON.stringify({
      floor: +floor,
    }));

    const socket = new WebSocket(`${urlData.urlWS}?access_token=${urlData.key}&filter=${filter}`);
    this.ws = socket;
    ++that.wsAttemptsCounter;

    socket.onopen = function(e) {
        console.log(`%c [ws open_HOST] - floor: ${floor} `, 'background: orange; color: black');
        socket.send(JSON.stringify({
            action: 'ping'
        }));
    };
    socket.onmessage = function(event) {
        console.log(`%c [ws message_HOST] : ${event.data}`, 'background: orange; color: black');
        const WSData = JSON.parse(event.data);
        if (that.floor == WSData.floor) {
          that.wsChanges = WSData;
        } else {
          console.log('[WS]---changes are not from this level');
        }
    };
    socket.onerror = function(event) {
      console.log('%c [ws error_HOST]', 'background: orange; color: black');
      if(that.wsAttemptsCounter <= 20) {   
        console.log(`%c ++ [ws message_MODULE] : new attempt ${that.wsAttemptsCounter} after ERROR`, 'background: orange; color: black');
        that.wsFunc(floor);     
      } else {
        console.error('WS connection failed after 20 attempts');
        that.wsAttemptsCounter = 0;
      }
    };
    socket.onclose = function(event) {
      console.log(`%c [ws close_HOST] - floor: ${floor}`, 'background: orange; color: black');
    };
  }

  ngOnInit() {
    const defaultFloor = '1';
    const paramsObj: ParamsObj = this.paramsParser(window.location.search.slice(1));
    console.log('--[url params:]', paramsObj);

    if(paramsObj.position) {
      this.position = Object.assign({}, paramsObj.position, {type: paramsObj.type || 'IFC'});
    }

    if(paramsObj.center) {
      this.center = Object.assign({}, paramsObj.center, {type: paramsObj.type || 'IFC'});;
    }
    if (paramsObj.zoom) {this.zoom = +paramsObj.zoom; }
    if (paramsObj.key) { this.apiKey = paramsObj.key; }
    if (paramsObj.version) {
        this.version = paramsObj.version;
    }
    if (paramsObj.v) { this.v = paramsObj.v; }

    if (paramsObj.floor && this.floors.indexOf(paramsObj.floor) > -1) {
        this.floor = paramsObj.floor;
    } else {
      this.floor = defaultFloor;
      console.log(`-- Bad params. Default floor: ${defaultFloor} was loaded`);
    }
    if (paramsObj.mode) { this.mode = paramsObj.mode; }
    if (this.mode === 'mobile') {
      this.wsFunc(this.floor);
      this.getFloorBlindsFromServerInHost(this.floor);
      this.getFloorRoomsFromServerInHost(this.floor);
    }
  }  
}

