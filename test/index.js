'use strict';

import { expect } from 'chai';
import Net from './../lib/index';


describe('Module Net', () => {

    describe('#constructor', () => {
        it('should construct and store custom options', () => {
            var block = new Net({
                interface: 'wlan1',

            });

            expect(block.iface).to.equal('wlan1');
        });
    });


    describe('update', () => {
        it('should update the output and fire updated', (done) => {
            //construct block
            var block = new Net({
                interface: 'wlanX'
            });

            execute(block, (output) => {
                //check output line
                expect(output.short_text).to.equal('<span font="Material-Design-Iconic-Font" size="large"></span>');
                expect(output.full_text).to.equal('<span font="Material-Design-Iconic-Font" size="large"></span>');

                done();
            });
        });
    });

})


//copied from i3-status
function execute(block, verify) {
    block.name = block.constructor.name;

    block.on('updated', (target, output) =>  {
        clearInterval(target.interval);

        expect(target.name).to.equal(block.name);
        verify(output);
    });

    //simulate set interval, will never fire
    block._interval = 10000;
    block.interval = setInterval(() => {
        block.update();
    }, block._interval);

    block.update();
}
