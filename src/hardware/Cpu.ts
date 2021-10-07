import { Ascii } from "../util/Ascii";
import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";
import { InterruptController } from "./InterruptController";
import { MMU } from "./MMU";
import { VirtualKeyboard } from "./VirtualKeyboard";

export class Cpu extends Hardware implements ClockListener{
    cpuClockCount : number = 0;
    private mmu : MMU = null;
    private mode : number = 0;
    private pc : number = 0x0000;
    private ir : number = 0x00;
    private acc : number = 0x00;
    private xReg : number = 0x00;
    private yReg : number = 0x00;
    private zFlag : number = 0x0;
    private step : number = 0;
    private logger : boolean = true;
    private pulseOn : boolean = true;
    private lowO : number = -1; // Using -1 for these because they are used as checks and can never be equal to -1 in the program
    private highO : number = -1;
    private constant : number = -1;
    private skip : number = 0;

    private intController : InterruptController = new InterruptController("IRC", 0);
    private keyboard : VirtualKeyboard = new VirtualKeyboard("VKB", 0, this.intController);


    constructor(newName: String, newIdNum: Number) {
        super(newName,newIdNum);
    }

    public pulse(){
        this.cpuClockCount++;
        if (this.pulseOn){
            this.log("received clock pulse - CPU Clock Count: " + this.cpuClockCount);
        }
        if (this.logger){
            this.getUpdate();
        }
        

        if (this.step == 0){
            this.fetch();
        }

        else if (this.step == 5){//fetch for lowO 
            this.lowO = this.fetchReturn();
        }

        else if (this.step == 6){//fetch for highO
            this.highO = this.fetchReturn();
        }

        else if (this.step == 7){//fetch for constant / non location data
            this.constant = this.fetchReturn();
        }
    
        else if (this.step == 1){
            this.decode(this.ir);
        }
    
        else if (this.step == 2){
            this.execute();
        }
    
        else if (this.step == 3){
            this.writeBack();
        }
    
        else if (this.step == 4){
            this.interruptCheck();
        }
    
    }
    
    public setMmu(newMmu : MMU){
        this.mmu = newMmu;
    }

    public setpulse(newPulse: boolean){
        this.pulseOn = newPulse;
    }

    public setLogger(newLogger : boolean){
        this.logger = newLogger;
    }

    public getUpdate(){
        if(this.logger){
            this.log("CPU State | Mode: " + this.mode + " PC: " + this.hexValue(Number(this.pc), 4) + " IR: " + this.hexValue(Number(this.ir), 2) + " Acc: " +
            this.hexValue(Number(this.acc), 2) + " xReg: " + this.hexValue(Number(this.xReg), 2) + " yReg: " + this.hexValue(Number(this.yReg), 2) + " zFlag: " + this.zFlag +
            " Step: " + this.step);
        }
    }

    //look at program counter then get that place in memeory and then call the decode
    public fetch(){
        //look at the memory spot of count
        //break down the count into high and low order
        let tempStr : String = this.hexValue(Number(this.pc), 4);
        let highOStr : string = tempStr[0] + tempStr[1];
        let lowOStr : string = tempStr[2] + tempStr[3];
        this.mmu.setHighOrder(parseInt(highOStr, 16));
        this.mmu.setLowOrder(parseInt(lowOStr, 16));

        this.pc++;
        this.step = 1;
        this.ir = this.mmu.readLittleE();
    }

    public fetchReturn(): number{
         //same function as above but now it dosent go right to decode
        let tempStr : String = this.hexValue(Number(this.pc), 4);
        let highOStr : string = tempStr[0] + tempStr[1];
        let lowOStr : string = tempStr[2] + tempStr[3];
        this.mmu.setHighOrder(parseInt(highOStr, 16));
        this.mmu.setLowOrder(parseInt(lowOStr, 16));

        this.pc++;
        this.step = 1;
        return this.mmu.readLittleE();
    }

    public decode(memData: number){
        //takes in the number and turns it into a string repersentation of a hex opcode
        //this.step = 2;
        //return this.hexValue(Number(memData), 2); //firgure out what to do with this

        let opCode = this.hexValue(Number(this.ir), 2);
        let temp : number = null;
        switch(opCode){
            
            case "A9": // Load the accumulator with a constant
                if(this.constant == -1){
                    this.step = 7;
                }
                else{
                    this.step = 2;
                }
                break;
            
            case "AD": // Load the accumulator from memory
                if(this.highLowFull()){
                    this.step = 2
                }
                break;
            
            case "8D": // Store the accumulator in memory
                if(this.highLowFull()){                    
                    this.step = 2
                }
                break;

            case "6D": // Add with carry
                if(this.highLowFull()){
                    this.step = 2
                }               
                break;

            case "A2": //Load the X register with a constant
                if(this.constant == -1){
                    this.step = 7;
                }
                else{
                    this.step = 2
                }
                break;

            case "AE":// Load the X register from memory
                if(this.highLowFull()){
                    this.step = 2
                }               
                break;

            case "A0": // Load the Y register with a constant
                if(this.constant == -1){
                    this.step = 7;
                }
                else{
                    this.step = 2
                }
                break;

            case "AC": // Load the Y register from memory
                if(this.highLowFull()){
                    this.step = 2
                }               
                break;

            case "EA": // No Operation
                this.step = 2;
                break;
            
            case "00": // Break
                this.step = 2;
                break;

            case "EC": // Compare a byte in memory to the X reg  
                if(this.highLowFull()){
                    this.step = 2
                }
                break;

            case "D0": 
                if (this.constant == -1){
                    this.step = 7;
                }
                else{
                    this.step = 2
                }
                break; 

            case "EE": // Increment the value of a byte
                if(this.highLowFull()){
                    this.step = 2
                }
                break;
            
            case "FF": 
                if(this.xReg == 0x01){
                    this.step = 2
                }
                if (this.xReg == 0x02){
                    if(this.highLowFull()){
                        this.step = 2
                    }
                                      
                }
                else this.step = 4; // if the xReg is niether 1 nor 2
                
                break;
            
            default:
                break;
            
        }


    }

    public writeBack(){
        this.mmu.setMdr(this.acc);
        this.mmu.writeLittleE();
        this.highLowEnd();
    }

    
    public interruptCheck(): void{
        var temp: number = this.intController.nextInterrupt();
        if(temp != undefined){
            this.intController.log(Ascii.byteToLetter(temp));
        } 
        this.step=0;
    }


    public highLowFull(): boolean{
        let ans = true;
        if(this.lowO == -1){
            this.step = 5;
            ans = false;
        }
        else if(this.highO == -1){
            this.step = 6;
            ans = false;
        } 
        else{
            this.mmu.setLowOrder(this.lowO);
            this.mmu.setHighOrder(this.highO);
        }
        return ans
    }

    highLowEnd(){
        this.lowO = -1;
        this.highO = -1;
        this.step = 4;
    }

    public execute(){

        let opCode = this.hexValue(Number(this.ir), 2);
        let temp : number = null;
        switch(opCode){
            
            case "A9": // Load the accumulator with a constant
                this.acc = this.constant;
                this.constant = -1;
                this.step = 4;

                break;
            
            case "AD": // Load the accumulator from memory
                this.acc = this.mmu.readLittleE();
                this.highLowEnd();

                break;
            
            case "8D": // Store the accumulator in memory
                this.mmu.setMdr(this.acc);
                this.mmu.writeLittleE();
                this.highLowEnd()
                break;

            case "6D": // Add with carry
                this.acc += this.mmu.readLittleE(); 
                this.highLowEnd();             
                break;

            case "A2": //Load the X register with a constant
                this.xReg = this.constant;
                this.constant = -1;
                this.step = 4;
                break;

            case "AE":// Load the X register from memory
                this.xReg = this.mmu.readLittleE();
                this.highLowEnd();
                break;

            case "A0": // Load the Y register with a constant
                this.yReg = this.constant;
                this.constant = -1;
                this.step = 4;
                break;

            case "AC": // Load the Y register from memory
                this.yReg = this.mmu.readLittleE();
                this.highLowEnd();
                break;

            case "EA": // No Operation
                this.step = 4;
                break;
            
            case "00": // Break
                console.log("The program has finished running thank you!");
                process.exit(0);

            case "EC": // Compare a byte in memory to the X reg  
                temp = this.mmu.readLittleE();
                if (temp == this.xReg){
                    this.zFlag = 1;
                }
                this.highLowEnd();
                break;

            case "D0": 
                let tempStr = this.hexValue(Number(this.pc), 4);
                let lowO = tempStr[2] + tempStr[3]; //gets low order bytes
                temp = parseInt(lowO, 16) + this.constant;
                tempStr = this.hexValue(Number(temp), 2);
                this.pc = parseInt(""+this.hexValue(Number(this.pc), 4)[0] + this.hexValue(Number(this.pc), 4)[1] + tempStr, 16);
                this.constant = -1;
                this.step = 4;
                break; 

            case "EE": // Increment the value of a byte
                this.acc = this.mmu.readLittleE();
                this.acc++;
                this.step = 3; // writeBack();
                break;
            
            case "FF": 
                if(this.xReg == 0x01){
                    this.log("OUTPUT: " + this.hexValue(Number(this.yReg), 2));
                    this.step = 4;
                }
                if (this.xReg == 0x02){
                    this.mmu.setMar(this.mmu.convertToLittleE());
                    this.mmu.nextAddress(this.skip);
                    temp = this.mmu.read();
                    if(temp != 0x00){
                        this.log(Ascii.byteToLetter(temp));
                        this.skip++;
                    }
                    else{
                        this.skip = 0;
                        this.highLowEnd();
                    }
                                      
                }
                else this.step = 4; // if the xReg is niether 1 nor 2
                
                break;
            
            default:
                break;
            
        }
       
    }

}
