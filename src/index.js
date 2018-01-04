'use strict';

import { EventEmitter } from 'events';
import fs from 'fs';
import readline from 'readline';

export default class Net extends EventEmitter {
    
    constructor(options, output) {
        super();
        options = options || {};
        this.output = output || {};

        //custom config
        this.isUp = false;
        this.iface = options.interface || 'wlan0';
        this.filePath = '/proc/net/wireless';
        this.state = `/sys/class/net/${this.iface}/operstate`;

    }

    update() {

        this.emit('pause', this);

        if ( 
            ! fs.existsSync(this.state) 
            || ! fs.existsSync(this.filePath)
        ) {
            var down = '<span font="Material-Design-Iconic-Font" size="large"></span>';
            this.output.full_text = down;
            this.output.short_text = down;


            this.emit('resume', this);
            this.emit('updated', this, this.output);

            return false;
        }

        fs.readFile(this.state, 'utf8', (error, data) => {

            var upResult = data.trim();
            this.isUp = upResult == 'up';


            if ( ! this.isUp ) {
                
                var down = '<span font="Material-Design-Iconic-Font" size="large"></span>';
                this.output.full_text = down;
                this.output.short_text = down;


                this.emit('resume', this);
                this.emit('updated', this, this.output);

                return false;
            }

            var rd = readline.createInterface({
              input: fs.createReadStream(this.filePath),
              // output: process.stdout,
              console: false
            });

            rd.on('line', (line) => {

                line = line.replace(/ +(?= )/g,'').trim();
                
                
                var lr = line.split(' ');
                
                if ( lr[0].indexOf(this.iface) !== -1 ) {
                    let signal = Math.abs(parseInt(lr[3]));
                    let signalInPerc = Math.round((signal * 100) / 70);


                    var full = '<span font="Material-Design-Iconic-Font" size="large"></span>';
                    var notfull = '<span font="Material-Design-Iconic-Font" size="large"></span> ';
                    var weak = '<span font="Material-Design-Iconic-Font" size="large"></span> ';

                    var text = ' <span size="small"><sup>' + signalInPerc + '%</sup></span>';
                    var output = '';

                    switch(true) {
                        case (signalInPerc >= 80):
                            output = full + text;
                        break;
                        case (signalInPerc < 80 && signalInPerc > 20):
                            output = notfull + text;
                        break;
                        case (signalInPerc <= 20):
                            output = weak+ text;
                        break;
                    }

                    this.output.full_text = output;
                    this.output.short_text = output;


                    this.emit('resume', this);
                    this.emit('updated', this, this.output);
                }
            });
        });

    }

    action(action) {
        if (this.__reporter && this.__reporter.supports('html')) {
            var output = {
                header: 'Starter sample',
                content: `<h1>Hello World!</h1><p>Secret value is ${this.secretValue}`,
                userStyle: 'h1 { color: red }'
            };
            this.__reporter.display(output, action);
        }
    }

}