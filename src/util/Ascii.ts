


export class Ascii{

    // was going to make a swtich and do it that way but I figured that I would do some research 
    // I found these two methods which make this process much eaiser and with less lines of code

    //translates one byte into a letter (have to use String for this not string)
    static byteToLetter(byte: number): String{
        return String.fromCharCode(byte);
    }

    //takes the first letter of a string and makes it Ascii so only input 1 character
    static letterToByte(letter: String): number{
        return letter.charCodeAt(0);
    }

}