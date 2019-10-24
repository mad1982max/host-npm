import { Component, ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sideBarParams: string[] = ['MГёterom', 'Arbeidssplass', 'Klima', 'Lys', 'Kantine', 'Parkering', 'Mat', 'Tilbakemelding'];
  floors: string[] = ['1', '2', '3', '4', '5', '6', '7', 'U1', 'U2', 'U3'];
  floor: string = '1';
  objectToHighlight: any;
  position: any;
  inputId: string = "01-X09-B";
  inputColor = "#4000ff";
  inputArea = "zones";

  constructor(private ref: ChangeDetectorRef) {
    let defaultFloor = '1';
    let paramsObj = this.paramsParser(window.location.search.slice(1));
    console.log('-paramsObj:', paramsObj);

    this.position = paramsObj.position;
   
    if (paramsObj.floor && this.floors.indexOf(paramsObj.floor) > -1) {
        this.floor = paramsObj.floor;
    } else {
      this.floor = defaultFloor;
      console.log(`--Bad params. Default floor: ${defaultFloor} was loaded`);      
    }
  }

  paramsParser(query) {
    let paramPairsArr = query.split('&');
    let paramsObj: any = {};

    paramPairsArr.forEach(pair => {
    let splitedPair = pair.split('=');
    let value: any = {};
    if (splitedPair[0] === 'position') {
      let valArr = splitedPair[1].split(',');
      value.top = valArr[0]/100;
      value.left = valArr[1]/100;
    } else {
      value = splitedPair[1]
    }
    paramsObj[splitedPair[0]] = value;
    })
    return paramsObj;
  }

  highLight(): void {
    this.objectToHighlight = {
      id: this.inputId,
      area: this.inputArea,
      color: this.inputColor
    }
  }

  changeFloor(floor: string): void {
    this.objectToHighlight = undefined;
    this.floor = floor;
    console.log('NEW FLOOR: ', this.floor);
  }

  getCurrentCell(cell: string): void {
    this.inputId = cell;
    this.ref.detectChanges();
  }
}
