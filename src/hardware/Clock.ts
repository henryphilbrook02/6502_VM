import { Cpu } from "./Cpu";
import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";


export class Clock extends Hardware{
    private clockListeners:  Array<ClockListener>;
    private logOn: boolean = true;

    constructor(newName: String, newIdNum: Number) {
        super(newName,newIdNum);
        this.clockListeners = new Array<ClockListener>();
    }

    public addListener(newListener:ClockListener){
        this.clockListeners.push(newListener);
    }

    public getClockListeners(): Array<ClockListener>{
        return this.clockListeners;
    }

    public setLogOn(newLogOn: boolean){
        this.logOn = newLogOn;
    }

    public clockCycle(): any{
        if(this.logOn){
            this.log("Clock Pulse Initialized");
        }
        for (let i = 0; i < this.clockListeners.length; i++) {
            this.clockListeners[i].pulse(); 
        }
    }

}
