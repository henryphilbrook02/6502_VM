/* ------------
     VirtualKeyboard.ts
        TODO: BG
     ...

     I don't know if i need this class yet.

     I think it will depend on how events are handled.  Really the keyboards buffer would receive a character and raise
     the keyboard interrupt.  Then the CPU would wake up at the end of the cycle, push the current application to the
     stack and load up the Keyboard driver.

     Maybe another observer pattern on a Interrupt handler class.  All hardware assigned an interrupt will be assigned
     an IRQ number and a ISR which points to the driver.  Then when the Interrupt handler class receives
     ------------ */

import { Hardware } from "./Hardware";
import { Interrupt } from './imp/Interrupt';
import { InterruptController } from "./InterruptController";
import { Queue } from "../util/Queue";

export class VirtualKeyboard extends Hardware implements Interrupt {
    constructor(name : string, id : number, interruptController : InterruptController) {
        super(name, id);

        this.isExecuting = false;

        this.irq = -1;        // IRQ num is assigned by the controller
        this.priority = 2;

        this.inpBuffer = new Queue();
        this.outBuffer = new Queue();

        this.interruptController = interruptController;

        this.monitorKeys();
        this.log("Created");
    }

    public isExecuting: boolean;

    // reference to the interrupt controller
    private interruptController: InterruptController;

    irq: number;
    name: string;
    inpBuffer: Queue;
    outBuffer: Queue;

    private monitorKeys() {
        /*
        character stream from stdin code (most of the contents of this function) taken from here
        https://stackoverflow.com/questions/5006821/nodejs-how-to-read-keystrokes-from-stdin
 
        This takes care of the simulation we need to do to capture stdin from the console and retrieve the character.
        Then we can put it in the buffer and trigger the interrupt.
         */
        var stdin = process.stdin;

        // without this, we would only get streams once enter is pressed
        if (stdin.isTTY) stdin.setRawMode(true); // not sure if i should do 

        // resume stdin in the parent process (node app won't quit all by itself
        // unless an error or process.exit() happens)
        stdin.resume();

        // i don't want binary, do you?
        //stdin.setEncoding( 'utf8' );
        stdin.setEncoding(null);


        stdin.on('data', function (key) {
            //let keyPressed : String = key.charCodeAt(0).toString(2);
            //while(keyPressed.length < 8) keyPressed = "0" + keyPressed;
            let keyPressed: String = key.toString();

            this.log("Key pressed - " + keyPressed);

            // ctrl-c ( end of text )
            // this let's us break out with ctrl-c
            if (key.toString() === '\u0003') {
                process.exit();
            }

            // write the key to stdout all normal like
            //process.stdout.write( key);
            // put the key value in the buffer
            // your code here

            // set the interrupt!
            this.outBuffer.push(this.priority, key.charCodeAt(0))
            this.interruptController.newInterrupt(this);

            // .bind(this) is required when running an asynchronous process in node that wishes to reference an
            // instance of an object.
        }.bind(this));


        /*
        var stdin = process.stdin;
        //require('tty').setRawMode(true);
        stdin.setRawMode( true );
        stdin.resume();
 
        stdin.on('keypress',  (chunk, key) => {
 
            this.log('Get Chunk: ' + chunk + '\n');
            if (key && key.ctrl && key.name == 'c') process.exit();
        }.bind(this));
 
         */

    }

    priority: number;

}
