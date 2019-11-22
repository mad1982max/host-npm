import { Component, ChangeDetectorRef } from '@angular/core';

interface Coord {
  left: number;
  top: number;
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
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  floors: string[] = ['1', '2', '3', '4', '5', '6', '7', 'U1', 'U2', 'U3'];
  floor = '1';
  objectToHighlight: HighLightObj | undefined ;
  position: Coord;
  blindObj: BlindsObj;
  zoom;
  inputPosition: string;
  zoomLevel;
  objectToZoom;
  apiKey: string;
  center: Coord;
  v: string;
  
  inputIdRoom = '04-X09-H';
  inputIdZone = '04-X09-H';
  inputColor = '#4000ff';
  inputArea = 'zones';
  paramToShow = 'roomNumber';
  version = 'white';
  inputCoordParam = 'IFC'

  //mode = 'mobile';
  mode = 'application';

  hostRoomsWithNegativeFB = [
    {
        "appVersion": "0.0.1",
        "name": "Rune Melberg",
        "source": "Mobile App",
        "floor": 4,
        "message": "werwer",
        "type": "negative",
        "uuid": "34e083df6108b6f35b7ad827b13ef6b7",
        "email": "rune.melberg@gmail.com",
        "platform": "iOS",
        "roomId": 429,
        "status": "NOT_RESOLVED",
        "timestamp": "2019-11-11T21:30:08.407Z",
        "bimRoomId": "04_X09_D"
    },
    {
        "appVersion": "0.0.1",
        "name": "Dusan Jovanovski",
        "source": "Mobile App",
        "floor": 4,
        "message": "Moterom 405 on Floor 4",
        "type": "negative",
        "uuid": "cbe4bf1beb16c022b9181d8753a2e0e9",
        "email": "dusan@smartplants.io",
        "platform": "iOS",
        "roomId": 405,
        "status": "NOT_RESOLVED",
        "timestamp": "2019-11-06T12:39:55.071Z",
        "bimRoomId": "04_X09_H"
    },
    {
        "appVersion": "0.0.1",
        "name": "Dusan Jovanovski",
        "source": "Mobile App",
        "floor": 4,
        "message": "dadada",
        "type": "negative",
        "uuid": "38bdda17f39b99fd65e217191810086b",
        "email": "dusan@smartplants.io",
        "platform": "iOS",
        "roomId": 405,
        "status": "NOT_RESOLVED",
        "timestamp": "2019-11-06T09:37:20.121Z",
        "bimRoomId": "04_X09_H"
    }
];

  hostRooms = [    
    {
        "bimRoomId": "04_X06_C",
        "light": 62,
        "logicalRoomId": 427,
        "temperature": 23.4,
        "description": "Arbeidsrom",
        "category": "work_room",
        "floor": 4,
        "occupied": true,
        "capacity": 3,
        "available": false,
        "roomStatus": "something elese"
    }
];
  hostBlinds = [
    {
        "state": "closed",
        "objectName": ".x237_04_Y01_B_XM601_STA",
        "bimBlindId": "237.04-Y01-B-XM601_"
    },
    {
        "state": "closed",
        "objectName": ".x237_04_X13_O_XM601_STA",
        "bimBlindId": "237.04-X13-O-XM601_"
    },
    {
        "state": "closed",
        "objectName": ".x237_04_Y06_A_XM601_STA",
        "bimBlindId": "237.04-Y06-A-XM601_"
    },
    {
        "state": "closed",
        "objectName": ".x237_04_Y03_B_XM601_STA",
        "bimBlindId": "237.04-Y03-B-XM601_"
    },
    {
        "state": "closed",
        "objectName": ".x237_04_Y08_A_XM601_STA",
        "bimBlindId": "237.04-Y08-A-XM601_"
    },
    {
        "state": "closed",
        "objectName": ".x237_04_Y01_A_XM601_STA",
        "bimBlindId": "237.04-Y01-A-XM601_"
    },
    {
        "state": "closed",
        "objectName": ".x237_04_X16_K_XM601_4_STA",
        "bimBlindId": "237.04-X16-K-XM601_4"
    }
];

  constructor(private ref: ChangeDetectorRef) {
    const defaultFloor = '1';
    const paramsObj: ParamsObj = this.paramsParser(window.location.search.slice(1));
    console.log('--[url params:]', paramsObj);

    this.position = paramsObj.position;
    this.center = paramsObj.center;
    this.zoom = paramsObj.zoom;
    if (paramsObj.key) { this.apiKey = paramsObj.key; }
    if (paramsObj.version) {
        this.version = paramsObj.version
    }
    if (paramsObj.v) { this.v = paramsObj.v }

    if (paramsObj.floor && this.floors.indexOf(paramsObj.floor) > -1) {
        this.floor = paramsObj.floor;
    } else {
      this.floor = defaultFloor;
      console.log(`--Bad params. Default floor: ${defaultFloor} was loaded`);
    }
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
        value.top = +valArr[1] / 100;
        value.left = +valArr[0] / 100;
        break;
      default:
        value = splitedPair[1];
    }
    paramsObj[splitedPair[0]] = value;
    });
    return paramsObj;
  }

  highLight(): void {
    let id = this.inputArea === 'zones' ? this.inputIdZone : this.inputIdRoom;
    this.objectToHighlight = {
      id: id,
      area: this.inputArea,
      color: this.inputColor
    };
  }

  zoomInOut(): void {
    let id = this.inputArea === 'zones' ? this.inputIdZone : this.inputIdRoom;
    this.objectToZoom = {
      id: id,
      area: this.inputArea,
      zoom: this.zoom
    };
    console.log('this.objectToZoom', this.objectToZoom);    
  }

  changeFloor(floor: string, v?: string): void {
    this.inputIdZone = '';
    this.inputIdRoom = '';
    this.v = v;
    this.floor = floor;
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
    if (this.inputPosition) {
      const posArr = this.inputPosition.split(',');
      this.position = {top: +posArr[1] / 100, left: +posArr[0] / 100};
    } else {
      console.log('PLEASE, CHECK POSITION FIELD');      
    }    
  }

  switcher(paramToShow: string): void {
    this.paramToShow = paramToShow;
  }
}
