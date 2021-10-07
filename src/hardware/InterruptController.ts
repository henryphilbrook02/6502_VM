import { Hardware } from "./Hardware";
import { Interrupt } from "./imp/Interrupt";

export class InterruptController extends Hardware{
    private inputs: Interrupt[] = [];

    constructor(name : string, idNum : number) {
        super(name, idNum);
    }

    public newInterrupt(newIntr : Interrupt){
        this.inputs.push(newIntr);
    }

    public nextInterrupt(){
        if (this.inputs.length == 0 || this.inputs == undefined){}
        else {
            var nextIntr: Interrupt = this.inputs.pop();
            return nextIntr.outBuffer.pop();
        }
    }
}