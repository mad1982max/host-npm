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

interface ObjectToZoom {
 id: string;
 area: string;
 zoom: number
}

interface Blind {
  bimBlindId: string;
  state: string
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
  [key: string]: string;
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
  objectToZoom: ObjectToZoom;
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
  hostBlinds: Blind[];
  hostRooms: any;
  hostRoomsWithNegativeFB: any;
  blindSuccessObj: any;
  ws: WebSocket;
  wsChanges: any;
  mode = 'application';
  wsAttemptsCounter = 0;
  idForBlindsGroup = 0;
  clickedBlindsArr = [];
  timerLoader: number;
  timerApiDataHost: number;
  timerPing: number;
  wsReconnectTimer: number;

  constructor(
    private ref: ChangeDetectorRef,
    private dataService: DataService) {}

  paramsParser(query: string): ParamsObj {
    const paramPairsArr = query.split('&');
    const paramsObj = {};

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

  counter(counter: number): void {
    this.zoom = this.zoom + counter;
  }

  highLight(): void {
    const id = this.inputArea === 'zones' ? this.inputIdZone : this.inputIdRoom;
    this.objectToHighlight = {
      id,
      area: this.inputArea,
      color: this.inputColor
    };
  }

  zoomInOut(): void {
    const id = this.inputArea === 'zones' ? this.inputIdZone : this.inputIdRoom;
    this.objectToZoom = {
      id,
      area: this.inputArea,
      zoom: this.zoom
    };
    console.log(' -- objectToZoom', this.objectToZoom);
  }

  changeFloor(floor: string): void {
    this.floor = floor;
    if (this.mode === 'application') { 
      // some action     
    } else if (this.mode === 'mobile') {
      clearInterval(this.timerApiDataHost);
      clearInterval(this.timerPing);
      clearTimeout(this.wsReconnectTimer);
      this.wsAttemptsCounter = 0;
      if (this.ws) this.ws.close(1000);
      this.wsFunc(this.floor)
      this.getFloorBlindsFromServerInHost(this.floor);
      this.getFloorRoomsFromServerInHost(this.floor);

      this.timerApiDataHost = window.setInterval(() => {
        this.getFloorBlindsFromServerInHost(this.floor);
        this.getFloorRoomsFromServerInHost(this.floor);
      }, 90000) //in module  - 90 and 300 sec
    } else {
      console.log(' -- Error: Unknown mode', this.mode);
    }
    clearTimeout(this.timerLoader);
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
      this.getClickedBlindsObj(blindsObj);      
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
    this.dataService.getFloorBlinds2(floor)
    .subscribe(
      data => {        
        this.hostBlinds = data as Blind[];
        console.log(`%c[--serverBlindsHost] - ${this.hostBlinds.length}`, 'background: #0000cc; color: white');
      },
      error => console.log(' -- ERROR', error.message)
      );
  }

  getClickedBlindsObj(blindsObj: BlindsObj): void {
    const {bimBlindId, state} = blindsObj;

    this.dataService.blindAction(bimBlindId, state)
      .subscribe(
        data => {
          console.log(' ++ [response post__MODULE]', data);
          this.timerLoader = window.setTimeout(() => this.blindSuccessObj = Object.assign({}, {
            bimBlindId,
            state,
            status: true
          }), 300); //positive

        },
        error => {
          console.log(' ++ ERROR in blind action post', error.message);
          this.blindSuccessObj = Object.assign({}, {
            bimBlindId,
            state,
            status: false,
            disabled: true
          });
        });
  }

  showChangesWs(data) {
    if (data.logicalRoomId) {
      this.wsChanges = data;

    } else if (data.bimBlindId && this.version !== 'black') {

      this.blindSuccessObj = {
        bimBlindId: data.bimBlindId,
        state: data.changes.state,
        status: true
      }
    }
  }

  wsFunc(floor: string): void {
    const that = this;
    const filter = encodeURIComponent(JSON.stringify({
      floor: +floor,
    }));

    const socket = new WebSocket(`${urlData.urlWS}?access_token=${urlData.key}&filter=${filter}`);
    that.ws = socket;
    ++that.wsAttemptsCounter;

    socket.onopen = function(e) {
        console.log(`%c [ws open_HOST] - floor: ${floor} `, 'background: orange; color: black');
        that.timerPing = window.setInterval(() => {
          socket.send(JSON.stringify({
            action: 'ping'
          }));
          console.log('PING');        
        }, 60000);
    };
    socket.onmessage = function(event) {
        console.log(`%c [ws message_HOST] : ${event.data}`, 'background: orange; color: black');
        const WSData = JSON.parse(event.data);
        if (that.floor == WSData.floor) {
          that.showChangesWs(WSData);
          //that.wsChanges = WSData;
        } else {
          console.log('[WS]---changes are not from this level');
        }
    };
    socket.onerror = function(event) {
      console.log('%c [ws error_HOST]', 'background: orange; color: black');
      // if(that.wsAttemptsCounter <= 20) {   
      //   console.log(`%c ++ [ws message_HOST] : new attempt ${that.wsAttemptsCounter} after ERROR`, 'background: orange; color: black');
      //   that.wsFunc(floor);     
      // } else {
      //   console.error('WS connection failed after 20 attempts');
      //   that.wsAttemptsCounter = 0;
      // }
    };
    socket.onclose = function(event) {
      if (!event.wasClean || event.code !== 1000) {
        if (that.wsAttemptsCounter <= 20) {
          console.log(`%c ++ [ws message_MODULE] : new attempt ${that.wsAttemptsCounter} after ERROR`, 'background: orange; color: black');
          that.wsReconnectTimer = window.setTimeout(() => that.wsFunc(floor), 1000);
        } else {
          console.error('WS connection failed after 20 attempts');
          that.ws = null;
          that.wsAttemptsCounter = 0;
        }
      }
      console.log(`%c [ws close_HOST] - floor: ${floor}`, 'background: orange; color: black');
    };
  }

  ngOnInit() {    
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
      const defaultFloor = '1';
      this.floor = defaultFloor;
      console.log(`-- Bad params. Default floor: ${defaultFloor} was loaded`);
    }
    if (paramsObj.mode) { this.mode = paramsObj.mode; }
    if (this.mode === 'mobile') {
      this.wsFunc(this.floor);
      this.getFloorBlindsFromServerInHost(this.floor);
      this.getFloorRoomsFromServerInHost(this.floor);

      this.timerApiDataHost = window.setInterval(() => {
        this.getFloorBlindsFromServerInHost(this.floor);
        this.getFloorRoomsFromServerInHost(this.floor);
      }, 90000) //in module  - 90 and 300 sec
    }
  }  
}

