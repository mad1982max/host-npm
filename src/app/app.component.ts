import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { DataService } from './services/data.services';

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
  floors: string[] = ['1', '2', '3', '4', '5', '6', '7', 'U1', 'U2', 'U3'];
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
  x = 131.54376;
  y = 52.88082;
  hostBlinds: any;
  hostRooms: any;
  hostRoomsWithNegativeFB: any;
 
  //mode = 'mobile';
  mode = 'application';

  constructor(
    private ref: ChangeDetectorRef,
    private dataService: DataService) {
  }

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
    console.log('this.objectToZoom', this.objectToZoom);
  }

  changeFloor(floor: string, v?: string): void {
    if (this.mode === 'application') {
      this.floor = floor;
    } else if (this.mode === 'mobile') {
      this.floor = floor;
      this.getFloorBlindsFromServerInHost(this.floor);
      this.getFloorRoomsFromServerInHost(this.floor);
    } else {
      console.log('Error: Unknown mode', this.mode);
    }
    this.inputIdZone = '';
    this.inputIdRoom = '';
    this.v = v;
    this.paramToShow = 'roomNumber';
    console.log('NEW FLOOR: ', this.floor, this.v);
  }

  getCurrentCell(obj: ClickedArea): void {
    this.inputIdZone = obj.zone;
    this.inputIdRoom = obj.room;
    console.log('-catch in host', obj);
    this.ref.detectChanges();
  }

  getBlindInfo(blindsObj: any): void {
    this.blindObj = blindsObj;
    console.log('-catch in host blinds', this.blindObj);
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

  getFloorRoomsFromServerInHost(floor) {
    this.dataService.getFloorRooms(floor)
    .subscribe(
      data => {
        this.hostRooms = data;
        console.log(`%c[--serverRoomsHost] - ${this.hostRooms.length}`, 'background: green; color: white');
      },
      error => {
        console.log('ERROR in get floor rooms--', error.message);
        this.hostRooms = [];
        console.log(`%c[--serverRoomsHost] - ${this.hostRooms.length}`, 'background: green; color: white');
      });
  }

  getNegativeFB() {
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
          console.log(`%c[--serverNegativeFBHost] - ${this.hostRoomsWithNegativeFB.length}`, 'background: green; color: white');
        },
        error => console.log('ERROR', error.message)
      );
  }

  getFloorBlindsFromServerInHost(floor) {
    this.dataService.getFloorBlinds(floor)
    .subscribe(
      data => {
        this.hostBlinds = data;
        console.log(`%c[--serverBlindsHost] - ${this.hostBlinds.length}`, 'background: green; color: white');
      },
      error => console.log('ERROR', error.message)
      );
  }

  ngOnInit() {
    const defaultFloor = '1';
    const paramsObj: ParamsObj = this.paramsParser(window.location.search.slice(1));
    console.log('--[url params:]', paramsObj);

    if(paramsObj.position) {
      this.position = Object.assign({}, paramsObj.position, {type: paramsObj.type || 'IFC'});
    }

    if(paramsObj.center) {
      this.center = paramsObj.center;
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
      console.log(`--Bad params. Default floor: ${defaultFloor} was loaded`);
    }
    if (paramsObj.mode) { this.mode = paramsObj.mode; }
    if (this.mode === 'mobile') {
      this.getFloorBlindsFromServerInHost(this.floor);
      this.getFloorRoomsFromServerInHost(this.floor);
    }
}
}

