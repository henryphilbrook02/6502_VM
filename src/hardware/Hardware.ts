
export class Hardware{
    private debug: boolean = true;
    public name: String;
    private idNum: Number;
    private date: Date = new Date();

    constructor(newName: String, newIdNum: Number){
        this.name = newName;
        this.idNum = newIdNum
    }

    public setDebug(newDebug: boolean){
        this.debug = newDebug;
    }

    //DOES NOT RETURN A NUMBER this is for output formatting ONLY use parse int if you want to get a number
    public hexValue(val: Number, length: Number): String{
        let final = val.toString(16).toUpperCase();
        while (final.length < length) final = "0" + final;
        while (final.length > length) final = final.slice(1);
        return final;
    }

    public log(message: String){
        if (this.debug){
            let output: String = "[" + this.name + " id: " + this.idNum + " " + this.date.getTime() + "]: "+ message;
            console.log(output);
        }
    }
}