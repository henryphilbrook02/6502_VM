import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";

export class Memory extends Hardware implements ClockListener{
    private memory = new Array<number>(0xffff);
    private MAR : number = 0x0000; //For addresses / index
    private MDR : number = 0x00; //For data
    private pulseOn : boolean = true;
    
    constructor(newName: String, newIdNum: Number) {
        super(newName, newIdNum);
        for (let i = 0x0000; i < this.memory.length; i++) {
            this.memory[i] = 0x00;
        }
        this.log("Created - Addressable Space: " + this.memory.length);
    }

    //Resets the entire memory unit
    public reset(){
        for (let i = 0x0000; i < this.memory.length; i++) {
            this.memory[i] = 0x0000;
        }
        this.MAR = 0x0000;
        this.MDR = 0x00;
    }

    public displayMemory(index: number){
        if (index < 0x00 || index > 0x0014){
            this.log( "Address : 0x" + index.toString(16) + " Contains Value: ERR [hexValue conversion]: number undefined");
        }
        else
            this.log(String (this.hexValue(this.memory[index], 2)));
    }

    public pulse(){
        if(this.pulseOn){
            this.log("Received clock pulse");
        }
    }

    public setPulse(newPulseOn: boolean){
        this.pulseOn = newPulseOn;
    }

    public read(){
        // Sets MDR to the memory in the location of MAR
        this.MDR = this.memory[this.MAR];
    }

    public write(){
        // Sets MDR to MARs' location in memory
        this.memory[this.MAR] = this.MDR;
    }

    //Getters and Setters
    public getMAR(): number {
        return this.MAR;
    }
    public setMAR(newMAR:number){
        this.MAR = newMAR;
    }

    public getMDR(): number{
        return this.MDR;
    }
    public setMDR(newMDR: number){
        this.MDR = newMDR;
    }

}