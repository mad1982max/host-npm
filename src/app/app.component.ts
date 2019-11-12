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
  zoom?: Coord;
  position?: Coord;
  key?: string;
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
  tozoom: Coord;
  inputPosition: string;
<<<<<<< HEAD

  inputId = '01-X09-B';
  inputColor = '#4000ff';
  inputArea = 'rooms';
  apiKey = 'a5b8eb729a95493c98085ae141f23a41';
  paramToShow = 'roomNumber';

  //mode = 'mobile';
  mode = 'application';

  hostRoomsWithNegativeFB: [];

  hostRooms = [
    {
        bimRoomId: '04_X12_G',
        logicalRoomId: 409,
        description: 'Møterom',
        capacity: 10,
        light: 6,
        reserved: false,
        reservedBy: null,
        temperature: 11.6,
        category: 'meeting_room',
        floor: 4,
        occupied: false,
        reservedUntilDateTime: null
    },
    {
        bimRoomId: '04_X09_C',
        light: 80,
        logicalRoomId: 421,
        temperature: 23.1,
        description: 'Arbeidsrom',
        category: 'work_room',
        floor: 4,
        occupied: false,
        capacity: null
    },
    {
        bimRoomId: '04_X13_H',
        logicalRoomId: 417,
        description: 'Møterom',
        capacity: 3,
        light: 7,
        reserved: false,
        reservedBy: null,
        temperature: 23.4,
        category: 'meeting_room',
        floor: 4,
        occupied: false,
        reservedUntilDateTime: null
    },
    {
        bimRoomId: '04_X13_I',
        light: 58,
        logicalRoomId: 413,
        temperature: 23.4,
        description: 'Møterom',
        category: 'meeting_room',
        floor: 4,
        occupied: true,
        capacity: 3
    }
];
  hostBlinds = [
    {
      state: 'closed',
      objectName: '.x237_03_Y13_A_XM601_STA',
      bimBlindId: '237.03-Y13-A-XM601_'
    },
    {
      state: 'closed',
      objectName: '.x237_03_Y06_B_XM601_STA',
      bimBlindId: '237.03-Y06-B-XM601_'
    },
    {
      state: 'closed',
      objectName: '.x237_03_Y06_A_XM601_STA',
      bimBlindId: '237.03-Y06-A-XM601_'
    },
    {
      state: 'closed',
      objectName: '.x237_03_Y02_A_XM601_STA',
      bimBlindId: '237.03-Y02-A-XM601_'
    },
    {
      state: 'closed',
      objectName: '.x237_03_X12_P_XM601_2_STA',
      bimBlindId: '237.03-X12-P-XM601_2'
    },
    {
      state: 'closed',
      objectName: '.x237_04_Y01_B_XM601_STA',
      bimBlindId: '237.04-Y01-B-XM601_'
    },
    {
      state: 'closed',
      objectName: '.x237_04_X13_O_XM601_STA',
      bimBlindId: '237.04-X13-O-XM601_'
    },
    {
      state: 'closed',
      objectName: '.x237_04_X12_P_XM601_1_STA',
      bimBlindId: '237.04-X12-P-XM601_1'
    },
    {
      state: 'closed',
      objectName: '.x237_04_X13_P_XM601_1_STA',
      bimBlindId: '237.04-X13-P-XM601_1'
    },
    {
      state: 'closed',
      objectName: '.x237_04_X16_N_XM601_3_STA',
      bimBlindId: '237.04-X16-N-XM601_3'
    }
  ];
=======
  apiKey: string = 'a5b8eb729a95493c98085ae141f23a41';
  tempFlag = false;
  //modeObj;

  mode = 'application';
  hostRooms: string;
  hostBlinds: string;
>>>>>>> 8c9cc52d5fe79a8b2230455355a0d0374feea792

  constructor(private ref: ChangeDetectorRef) {
    const defaultFloor = '1';
    const paramsObj: ParamsObj = this.paramsParser(window.location.search.slice(1));
    console.log('--[url params:]', paramsObj);

    this.position = paramsObj.position;
    this.tozoom = paramsObj.zoom;
    if (paramsObj.key) { this.apiKey = paramsObj.key; }

    if (paramsObj.floor && this.floors.indexOf(paramsObj.floor) > -1) {
        this.floor = paramsObj.floor;
    } else {
      this.floor = defaultFloor;
      console.log(`--Bad params. Default floor: ${defaultFloor} was loaded`);
    }
  }

  paramsParser(query: string): ParamsObj {
    console.log(query);
    const paramPairsArr = query.split('&');
    const paramsObj: any = {};

    paramPairsArr.forEach(pair => {
    const splitedPair = pair.split('=');
    let value: any = {};
    switch (splitedPair[0]) {
      case 'position':
      case 'zoom':
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
    this.objectToHighlight = {
      id: this.inputId,
      area: this.inputArea,
      color: this.inputColor
    };
  }

  changeFloor(floor: string): void {
    // this.objectToHighlight = undefined;
    this.floor = floor;
    // this.tempFlag = false;
    this.paramToShow = 'roomNumber';
    console.log('NEW FLOOR: ', this.floor);
  }

  getCurrentCell(cell: string): void {
    this.inputId = cell;
    console.log('-catch in host room', this.inputId);
    this.ref.detectChanges();
  }

  getBlindInfo(blindsObj: any): void {
    this.blindObj = blindsObj;
    console.log('-catch in host blinds', this.blindObj);
  }

  showPosition(): void {
<<<<<<< HEAD
    const posArr = this.inputPosition.split(',');
    this.position = {top: +posArr[1] / 100, left: +posArr[0] / 100};
=======
    let posArr = this.inputPosition.split(',');
    this.position = {top: +posArr[1] / 100, left: +posArr[0] / 100}
>>>>>>> 8c9cc52d5fe79a8b2230455355a0d0374feea792
  }

  switcher(paramToShow: string): void {
    this.paramToShow = paramToShow;
  }
}
