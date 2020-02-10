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

interface BlindObj {
    [key: string]: string;
    x: string;
    y: string;
}

interface HostRoom {
    roomStatus: string,
    light: number,
    logicalRoomId: number,
    technicalZoneIds: string[],
    temperature: number,
    description: string,
    category: string,
    floor: number,
    bimRoomId: string,
    occupied: boolean,
    capacity: number
}

interface BlindSuccessObj {
    bimBlindId: string,
    state: string,
    status: boolean,
    disabled?: boolean
}

interface HostRoomWithNegativeFB {
    bimRoomId?: string,
    roomId: number
}

interface WsChanges {
    floor: number,
    bimBlindId?: string,
    logicalRoomId?: number,
    changes: {
        state: string
    }
}


export {Coord, HighLightObj, ObjectToZoom, Blind, ParamsObj, ClickedArea, BlindObj, HostRoom, BlindSuccessObj, HostRoomWithNegativeFB, WsChanges}