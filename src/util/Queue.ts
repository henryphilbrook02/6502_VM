

export class Queue {

    private queue: Array<[number, number]> = [];

    push(priority: number, top: number): void {
        if (this.queue.length == 0) {
            this.queue.push([priority, top])
        } else {
            for (var i = 0; i < this.queue.length; i++){
                if (priority > this.queue[i][0]){
                    this.queue.splice(i,0,[priority,top]);
                    return
                }
            }
            this.queue.push([priority, top])
        }
    }

    pop(): number{
        if (this.queue != undefined && this.queue.length != 0){
            return this.queue.shift()[1];
        }
    }
}