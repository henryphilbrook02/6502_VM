

import { Queue } from "../../util/Queue";

export interface Interrupt{
    irq: number;
    priority: number;
    name: string;
    inpBuffer: Queue;
    outBuffer: Queue;
}