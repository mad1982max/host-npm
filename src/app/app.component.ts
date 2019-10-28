import { Component, ChangeDetectorRef } from '@angular/core';

interface Coord {
  left: string;
  top: string
}

interface HighLightObj {
  id: string;
  area: string;
  color: string;
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
  inputId = '01-X09-B';
  inputColor = '#4000ff';
  inputArea = 'zones';
  tozoom: Coord;

  constructor(private ref: ChangeDetectorRef) {
    const defaultFloor = '1';
    const paramsObj = this.paramsParser(window.location.search.slice(1));
    console.log('-urlParamsObj:', paramsObj);

    this.position = paramsObj.position;
    this.tozoom = paramsObj.zoom;
    
    if (paramsObj.floor && this.floors.indexOf(paramsObj.floor) > -1) {
        this.floor = paramsObj.floor;
    } else {
      this.floor = defaultFloor;
      console.log(`--Bad params. Default floor: ${defaultFloor} was loaded`);      
    }
  }

  paramsParser(query) {
    const paramPairsArr = query.split('&');
    const paramsObj: any = {};

    paramPairsArr.forEach(pair => {
    const splitedPair = pair.split('=');
    let value: any = {};
    switch (splitedPair[0]) {
      case 'position':
      case 'zoom':
        const valArr = splitedPair[1].split(',');
        value.top = valArr[1] / 100;
        value.left = valArr[0] / 100;
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
    this.objectToHighlight = undefined;
    this.floor = floor;
    console.log('NEW FLOOR: ', this.floor);
  }

  getCurrentCell(cell: string): void {
    this.inputId = cell;
    console.log('catch in host cell', this.blindObj);
    this.ref.detectChanges();
  }

  getBlindInfo(blindsObj: any): void {
    this.blindObj = blindsObj;
    console.log('catch in host blinds', this.blindObj);
  }
}
