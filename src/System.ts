// import statements for hardware
import {Cpu} from "./hardware/Cpu";
import {Hardware} from "./hardware/Hardware";
import { Memory } from "./hardware/Memory";
import { Clock } from "./hardware/Clock";
import { ClockListener } from "./hardware/imp/ClockListener";
import { setTimeout } from "timers";
import { MMU } from "./hardware/MMU";


/*
    Constants
*/
// Initialization Parameters for Hardware
// Clock cycle interval
const CLOCK_INTERVAL= 200;              // This is in ms (milliseconds) so 1000 = 1 second, 100 = 1/10 second
                                        // A setting of 100 is equivalent to 10hz, 1 would be 1,000hz or 1khz,
                                        // .001 would be 1,000,000 or 1mhz. Obviously you will want to keep this
                                        // small, I recommend a setting of 100, if you want to slow things down
                                        // make it larger.



export class System extends Hardware{

    public _CPU : Cpu = null;

    public memory : Memory = null;

    public _MMU : MMU = null;
    
    private running: boolean = false;

    public clock: Clock = null;

    constructor(newName: String, newIdNum: Number) {

        super(newName, newIdNum);

        this.log("created");
             
        /*
        Start the system (Analogous to pressing the power button and having voltages flow through the components)
        When power is applied to the system clock, it begins sending pulses to all clock observing hardware
        components so they can act on each clock cycle.
         */

        this.startSystem();


    }

    public startSystem(): boolean {
        
        //initilize the CPU
        this._CPU = new Cpu("CPU", 0);
        //this._CPU.setDebug(false);
        this._CPU.log("created");
        this._CPU.setpulse(false); // turns off the pulse read
        // I like having this on --> this._CPU.setLogger(false); // turns off the logger of all the cpu attributes

        //Initilize the Memory
        this.memory = new Memory("RAM", 0);
        this.memory.log("created");
        //this.memory.displayMemory(0x12);
        //this.memory.displayMemory(0x1000);
        this.memory.setPulse(false);

        //initilize the MMU
        this._MMU = new MMU("MMU", 0, this.memory);
        this._CPU.setMmu(this._MMU);
        this._MMU.log("Created");
        /*
        this._MMU.writeImmediate(0x00, 0xA9);
        this._MMU.writeImmediate(0x01, 0x0D);
        this._MMU.writeImmediate(0x02, 0xA9);
        this._MMU.writeImmediate(0x03, 0x1D);
        this._MMU.writeImmediate(0x04, 0xA9);
        this._MMU.writeImmediate(0x05, 0x2D);
        this._MMU.writeImmediate(0x06, 0xA9);
        this._MMU.writeImmediate(0x07, 0x3F);
        this._MMU.writeImmediate(0x08, 0xA9);
        this._MMU.writeImmediate(0x09, 0xFF);
        this._MMU.writeImmediate(0x0A, 0x00);
        
        this._MMU.memoryDump(0x00, 0x0F);
        */

        // // load constant 0
        // this._MMU.writeImmediate(0x0000, 0xA9);
        // this._MMU.writeImmediate(0x0001, 0x00);
        // // write acc (0) to 0040
        // this._MMU.writeImmediate(0x0002, 0x8D);
        // this._MMU.writeImmediate(0x0003, 0x40);
        // this._MMU.writeImmediate(0x0004, 0x00);
        // // load constant 1
        // this._MMU.writeImmediate(0x0005, 0xA9);
        // this._MMU.writeImmediate(0x0006, 0x01);
        // // add acc (?) to mem 0040 (?)
        // this._MMU.writeImmediate(0x0007, 0x6D);
        // this._MMU.writeImmediate(0x0008, 0x40);
        // this._MMU.writeImmediate(0x0009, 0x00);
        // // write acc ? to 0040
        // this._MMU.writeImmediate(0x000A, 0x8D);
        // this._MMU.writeImmediate(0x000B, 0x40);
        // this._MMU.writeImmediate(0x000C, 0x00);
        // // Load y from memory 0040
        // this._MMU.writeImmediate(0x000D, 0xAC);
        // this._MMU.writeImmediate(0x000E, 0x40);
        // this._MMU.writeImmediate(0x000F, 0x00);
        // // Load x with constant (1) (to make the first system call)
        // this._MMU.writeImmediate(0x0010, 0xA2);
        // this._MMU.writeImmediate(0x0011, 0x01);
        // // make the system call to print the value in the y register (3)
        // this._MMU.writeImmediate(0x0012, 0xFF);
        // // Load x with constant (2) (to make the second system call for the string)
        // this._MMU.writeImmediate(0x0013, 0xA2);
        // this._MMU.writeImmediate(0x0014, 0x02);
        // // make the system call to print the value in the y register (3)
        // this._MMU.writeImmediate(0x0015, 0xFF);
        // this._MMU.writeImmediate(0x0016, 0x50);
        // this._MMU.writeImmediate(0x0017, 0x00);
        // // test DO (Branch Not Equal) will be NE and branch (0x0021 contains 0x20 and xReg contains B2)
        // this._MMU.writeImmediate(0x0018, 0xD0);
        // this._MMU.writeImmediate(0x0019, 0xED);
        // // globals
        // this._MMU.writeImmediate(0x0050, 0x2C);
        // this._MMU.writeImmediate(0x0052, 0x00);
        // this._MMU.memoryDump(0x0000, 0x001A);
        // console.log("----------------------------------------------------------");
        // this._MMU.memoryDump(0x0050, 0x0053);

        // load constant 3
        this._MMU.writeImmediate(0x0000, 0xA9);
        this._MMU.writeImmediate(0x0001, 0x0A);
        // write acc (3) to 0040
        this._MMU.writeImmediate(0x0002, 0x8D);
        this._MMU.writeImmediate(0x0003, 0x40);
        this._MMU.writeImmediate(0x0004, 0x00);
        // :loop
        // Load y from memory (3)
        this._MMU.writeImmediate(0x0005, 0xAC);
        this._MMU.writeImmediate(0x0006, 0x40);
        this._MMU.writeImmediate(0x0007, 0x00);
        // Load x with constant (1) (to make the first system call)
        this._MMU.writeImmediate(0x0008, 0xA2);
        this._MMU.writeImmediate(0x0009, 0x01);
        // make the system call to print the value in the y register (3)
        this._MMU.writeImmediate(0x000A, 0xFF);
        // Load x with constant (2) (to make the second system call for the string)
        this._MMU.writeImmediate(0x000B, 0xA2);
        this._MMU.writeImmediate(0x000C, 0x02);
        // make the system call to print the value in the y register (3)
        this._MMU.writeImmediate(0x000D, 0xFF);
        this._MMU.writeImmediate(0x000E, 0x50);
        this._MMU.writeImmediate(0x000F, 0x00);
        // load the string
        // 0A 48 65 6c 6c 6f 20 57 6f 72 6c 64 21
        this._MMU.writeImmediate(0x0050, 0x0A);
        this._MMU.writeImmediate(0x0051, 0x48);
        this._MMU.writeImmediate(0x0052, 0x65);
        this._MMU.writeImmediate(0x0053, 0x6C);
        this._MMU.writeImmediate(0x0054, 0x6C);
        this._MMU.writeImmediate(0x0055, 0x6F);
        this._MMU.writeImmediate(0x0056, 0x20);
        this._MMU.writeImmediate(0x0057, 0x57);
        this._MMU.writeImmediate(0x0058, 0x6F);
        this._MMU.writeImmediate(0x0059, 0x72);
        this._MMU.writeImmediate(0x005A, 0x6C);
        this._MMU.writeImmediate(0x005B, 0x64);
        this._MMU.writeImmediate(0x005C, 0x21);
        this._MMU.writeImmediate(0x005D, 0x0A);
        this._MMU.writeImmediate(0x005E, 0x00);
        this._MMU.memoryDump(0x0000, 0x0010);
        this.log("---------------------------");
        this._MMU.memoryDump(0x0040, 0x0043);
        this.log("---------------------------");
        this._MMU.memoryDump(0x0050, 0x005C);

        //Starts the system clock
        this.clock = new Clock("CLK", 0);
        this.clock.log("created");
        this.clock.setLogOn(false);
        this.clock.addListener(this.memory);
        this.clock.addListener(this._CPU);

        setInterval(() => { this.clock.clockCycle() }, CLOCK_INTERVAL);
 
        return true;
    }

    public stopSystem(): boolean {
        return false;
    }

}   

let system: System = new System("First System", 0);
