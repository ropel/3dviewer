
//Gets console
let nodeConsole = require('console');
let shellConsole = new nodeConsole.Console(process.stdout, process.stderr);


class Button {
    constructor(icon="", tooltipText="", shortcut=""){
        this.icon = icon;
        this.tooltipText = tooltipText;
        this.shortcut = shortcut;
        shellConsole.log("built button");
    }
}

module.exports = { Button }