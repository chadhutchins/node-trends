var WIDTH = $(window).width();
var HEIGHT = $(window).height();

function AnimationStack() {
    this.words = [];
}

AnimationStack.prototype.pushElement = function(element) {
    this.words.push(element);
}

AnimationStack.prototype.popElement = function() {
    if (this.words.length>0) {
        var element = this.words.shift();
        element.animate({top:HEIGHT},1000,function(){
            $(this).remove();
        });
    }
}

function WordGraph() {
    this.words = {};
    this.topWords = {};
    this.topWordCount = 0;
}

WordGraph.prototype.pushWord = function(word) {
    if (/^[@#_a-zA-Z]*$/.test(word) && word.toLowerCase()!="rt" && word.toLowerCase()!="a" && word.toLowerCase()!="to" && word.toLowerCase()!="isturnedonby" && word.toLowerCase()!="#isturnedonby") {
        if (word in this.words) {
            this.words[word]++;
        } else {
            this.words[word] = 1;
        }
    }
}

WordGraph.prototype.update = function() {
    for (var word in this.words) {
        if (this.topWords.length>0 && this.topWords.length<=10) {
            for (var topWord in this.topWords) {
                if (this.words[word]>=this.topWords[topWord]) {
                    delete this.topWords[topWord];
                    this.topWords[word] = this.words[word];
                }
            }
        } else {
            this.topWords[word] = this.words[word];
        }
    }
    for (var topWord in this.topWords) {
        if (this.topWords[topWord]>this.topWordCount) {
            this.topWordCount = this.topWords[topWord];
        }
    }
    var i=0;
    for (var topWord in this.topWords) {
        var count = this.topWords[topWord];
        var height = ((HEIGHT-50) * (count/this.topWordCount))+50;
        var top = HEIGHT - height;
        $("#topWord"+i)
            .html(topWord+": "+this.topWords[topWord])
            .height(height)
            .css({top: top});
        i++;
    }
}

$(document).ready(function(){
    for (var i=0;i<10;i++) {
        var id = "#topWord"+i;
        var margin = 10;
        var width = Math.floor(WIDTH/10) - margin;
        var height = 50;
        var top = HEIGHT-height;
        var left = i*(width+margin);
        $(id)
            .width(width)
            .height(height)
            .css({top: top, left: left});
    }
});

var animationStack = new AnimationStack();
var wordGraph = new WordGraph();

setInterval(function() { animationStack.popElement(); },50);
setInterval(function() { wordGraph.update(); },1000);

var socket = new io.Socket('localhost');
socket.connect();

socket.on('connect', function(){
    // do something when client connects
});

socket.on('message', function(data) { 
    var words = data.text.split(" ");

    var incLeft = Math.floor(WIDTH / words.length);
    var incTop = 0;

    for (var i=0; i<words.length; i++)
    {
        var left = i * incLeft;
        var top = i * incTop - 100;
        var div = $("<div></div>")
            .html(words[i])
            .addClass('word')
            .css({left: left, top: top});

        animationStack.pushElement(div);
        wordGraph.pushWord(words[i]);

        $("#wrapper").append(div);
    }
});