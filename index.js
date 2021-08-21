'use strict';
const Alexa = require('alexa-sdk');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
const APP_ID = undefined;
var src_bkt = "dictatebucket";
var src_key = "s3text.txt";
var dat = '';
var dict = {
  'first' : 1,
  'second' : 2,
  'third' : 3,
  'fourth' : 4,
  'fifth' : 5,
  'sixth' : 6,
  '1st' : 1,
  '2nd' : 2,
  '3rd' : 3,
  '4th' : 4,
  '5th' : 5,
  '6th' : 6
};
const HELP_MESSAGE = 'You have to upload your text on our website and I can dictate, spell or repeat your text for you on a pace accepetable to you. If you have not uploaded the text yet then upload the text and then open the skill. If you have uploaded the text and you want to give me the ID then say my ID is ..... and then your ID number in individual digits, example my ID is 1, 2, 3, 4. If you want me to start reading then say start reading, or continue, or next. What Do you want me to do?';
const HELP_REPROMPT = 'What do you want me to do?';
const STOP_MESSAGE = 'Goodbye!';
//var j = 0;
var k = 0;
var sent = '';
var s1 = '<say-as interpret-as="spell-out">';
var s2 = '</say-as>';
var sentData = '';
function sp_out(sentence, v){
    sent = '';
    var words = sentence.split(' ');
    while(sent.length < 20 && v < sentence.length){
                sent += words[v] + ' ';
                v += 1;
    }
    return [sent, v];
}
function sp_ch(str){
    var s = '<prosody rate="65%">';
    sentData = '';
    var w = str.split(' ');
    for(var k = 0; k < w.length; k++){
        for(var l = 0; l < w[k].length; l++){
            var x = w[k][l].charCodeAt(0);
            if(x >= 65 && x <= 90 || x >= 97 && x <= 122 || x >= 48 && x <= 57){
                s += w[k][l];
                sentData += w[k][l];
            }
            else{
                s += ' ' + s1 + w[k][l] + s2 + ' ';
                sentData = ' ' + w[k][l] + ' ';
            }
        }
        s += ' ';
        sentData += ' ';
    }
    s += '</prosody>';
    return [s, sentData];
}
const handlers = {
    'LaunchRequest': function () {
        //j = 0;
        sent = '';
        sentData = '';
        this.emit(':ask','Welcome to Dictate, tell me your ID to dictate.');
    },
    'KeyIntent': function () {
        this.attributes['key'] = this.event.request.intent.slots.id.value;
        var fil = 'content ' + this.attributes['key'] + '.txt';
        s3.getObject({
        Bucket: src_bkt,
        Key: fil//src_key
    }, function(err, data) {
        //this.attributes['inp'] = data.Body.toString('ascii');
        if (err) {
            console.log(err, err.stack);
            //callback(err);
        } //else {
            dat = data.Body.toString('ascii');
            //console.log("Raw text:\n" + data.Body.toString('ascii'));
            //callback(null, data.Body.toString('ascii'));
        //}
    });
        this.attributes['j'] = 0;
        var out = 'ID Received ' + '<say-as interpret-as="spell-out">' + this.attributes['key'] + '</say-as>';
        this.response.speak(out + '...say start reading to go ahead').listen();
        this.emit(':responseReady');
    },
    'SpeakIntent': function () {
        /*if(k == 0){
            this.response.speak('I am going to dictate now, say next to start').listen('say next to start');
            k = 1;
            this.emit(':responseReady');
        }*/
        //if(k == 1){
        var words = dat.split(' ');//this.attributes['inp'].split(' ');
        if(this.attributes['j'] < words.length){
            var x = sp_out(dat, this.attributes['j']);
            this.attributes['j'] = x[1];
            /*if(sent.length < 20){
                sent += words[j] + ' ';
                j += 1;
                if(j != words.length){
                this.emit('SpeakIntent');}
            }*/
            var item = sp_ch(x[0]);
            //var item = sp_ch(sent);
            this.attributes['itemData'] = item[0];
            this.attributes['sentData'] = item[1];
            sent = '';
            //var item = '<prosody rate="80%">' + data[i] + '</prosody>';//my name is <say-as interpret-as="spell-out">,</say-as> Saurabh</prosody>';
            this.response.speak(this.attributes['itemData']).listen();
            this.emit(':responseReady');
        }
        else{
            this.emit(':tell', 'My work is done here, submit your text again and open this skill for further use.....until then its goodbye from me');
        //}
    }},
    'RepeatIntent': function () {
        this.response.speak(this.attributes['itemData']).listen();
        this.emit(':responseReady');
    },
    'SpellIntent': function () {
        var num = dict[this.event.request.intent.slots.nth.value];
        var spell = '';//this.attributes['sentData'] + ' ' + num.toString();
        var rep = this.attributes['sentData'].split(' ');
        var c = 0;
        for(var k = 0; k < rep.length; k++){
            var x = rep[k][0].charCodeAt(0);
            if(x >= 65 && x <= 90 || x >= 97 && x <= 122 || x >= 48 && x <= 57){
                c += 1;
            }
            if(c == num){
                spell = '<prosody rate="80%"><say-as interpret-as="spell-out">' + rep[k] + '</say-as></prosody>';
                break;
            }
        }
        this.response.speak(spell).listen();
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        //const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen();
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.FallbackIntent': function () {
        this.response.speak('I did not understand what you said....say your ID if you have submitted the text or say next or continue if it has already started to dictate.').listen();
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        //this.shouldEndSession = true;
        this.emit(':tell', 'Goodbye!');
        //this.emit.shouldEndSession(true);
    }
};
exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
    
};