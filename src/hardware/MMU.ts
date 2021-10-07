import { moveEmitHelpers } from "typescript";
import { Hardware } from "./Hardware";
import { Memory } from "./Memory";


export class MMU extends Hardware{
    private mem: Memory;
    private highO: number = 0x00;
    private lowO: number = 0x00;

    constructor(newName: String, newIdNum: Number, newMem: Memory){
        super(newName, newIdNum);
        this.mem = newMem;
    }

    //gives a readout of 
    public memoryDump(fromAddress: number, toAddress: number){
        this.log("Memory Dump: Debug");
        this.log("----------------------------------------");
        for(let i = fromAddress; i <= toAddress; i++){
            this.setMar(i);
            this.log("Addr " + i.toString(16).toUpperCase() + ":   | " + this.hexValue(this.read(), 2));
        }
        this.log("----------------------------------------");
        this.log("Memory Dump: Complete");
    }
    

    // need a high and low number that has as setter and then the read an write that will put them together and push them to the memory
    // do this by having 2 hex numbers then turning them into strings then turning them back into numbers using like pasre int 

    //Loads a static program into memory
    public writeImmediate(mar: number, mdr: number){
        this.setMar(mar);
        this.setMdr(mdr);
        this.write();
    }
    
    public nextAddress(skips: number){
        this.setMar(this.mem.getMAR() + skips);
    }

    public setHighOrder(newHighO: number){
        this.highO = newHighO;
    }

    public setLowOrder(newLowO: number){
        this.lowO = newLowO;
    }

    public readLittleE(): number{
        this.setMar(this.convertToLittleE());
        return this.read();
    }

    public writeLittleE(){
        this.setMar(this.convertToLittleE());
        this.write();
    }

    public convertToLittleE(): number{
        let ans = this.hexValue(this.highO,2).concat(""+this.hexValue(this.lowO,2)) // have to use ""+ to make it a string not a String
        return parseInt(ans, 16);
    }

    // Methonds below are pretty mcuh a port to the memory class methods
    public setMar(mar: number){
        this.mem.setMAR(mar);
    }
    

    public setMdr(mdr: number){
        this.mem.setMDR(mdr);
    }
    public getMdr(): number{
        return this.mem.getMDR();
    }

    //Returnds the MDR data at the MAR location
    public read(): number{
        this.mem.read();
        return this.mem.getMDR()
    }

    public write(){
        this.mem.write();
    }
}