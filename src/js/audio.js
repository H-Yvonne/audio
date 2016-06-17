/**
 * @author H.Yvonne
 * @create 2016.5.12
 * audio
 */
(function (root, factory) {
    if (typeof exports === 'function') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return (root.audio = factory()); 
        });
    } else {
        root.audio = factory();
    }
})(this, function () {
    var plugin = function (config) {
        config = config || {};
        var o;
        for(o in config) {
            this[o] = config[o]; 
        }
        this.init();
    }

    //config
    $.extend(plugin.prototype, {
        mainWrap : '',
        audioUrl : '',
        autoPlay : false
    });

    //init
    $.extend(plugin.prototype, {
        init : function () {
            this.renderView();
            this.createEle();
            this.controlFn();
        }
    });

    //load file
    $.extend(plugin.prototype, {
        createEle : function () {
            this.audioEle = document.createElement('audio');
            this.audioEle.src = this.audioUrl;
            this.audioEvent();
        },
        audioEvent : function () {
            var _self = this, time;
            this.audioEle.addEventListener('play', function () {
                    _self.addListenTouch();
            });
            this.audioEle.addEventListener('progress', function () {
                _self.duration = _self.audioEle.duration;
                _self.timeout(_self.duration,$(_self.mainWrap).find('span[nt="total-time"]'));
            });
            this.audioEle.addEventListener('timeupdate', function () {
                time = _self.audioEle.currentTime;
                _self.total = $(_self.mainWrap).find('div.audio-progress-wrap').width();
                _self.timeout(time,$(_self.mainWrap).find('span[nt="current-time"]'));
                var per = time/_self.duration, 
                    lw = per*_self.total;
                _self.animateFn(lw);
            });
            this.audioEle.addEventListener('seeked', function () {
                console.log('seek');
            });
        },
        timeout : function (time,obj) {
            hour = Math.floor(time / (60 * 60));
            minute = Math.floor(time / 60) - (hour * 60);
            second = Math.floor(time) - (hour * 60 * 60) - (minute * 60);
            if (hour <= 9) hour = '0' + hour;
            if (minute <= 9) minute = '0' + minute;
            if (second <= 9) second = '0' + second;
            obj.html(hour+':'+minute+':'+second);
        },
        animateFn : function (lw) {
            $(this.mainWrap).find('div.audio-progress').animate({
                'width' : lw
            },50);
            $(this.mainWrap).find('span.audio-progress-btn').animate({
                'left' : lw
            },50);
        }
    });

    //control function
    $.extend(plugin.prototype, {
        showBtn : function () {
            var _self = this;
            var obj = {
                playBtn : function () {
                    $(_self.mainWrap).find('button.audio-play-btn').show();
                    $(_self.mainWrap).find('button.audio-pause-btn').hide();
                },
                pauseBtn : function () {
                    $(_self.mainWrap).find('button.audio-play-btn').hide();
                    $(_self.mainWrap).find('button.audio-pause-btn').show();
                }
            }
            return obj;
        },
        controlFn : function () {
            var _self = this, count = 1;
            $(this.mainWrap).on('click', 'button.audio-play-btn', function () {
                _self.audioEle.play();
                _self.showBtn().pauseBtn();
            }).on('click', 'button.audio-pause-btn', function () {
                _self.audioEle.pause();
                _self.showBtn().playBtn();
            }).on('click', 'button.audio-voice-wrap', function () {
                var __ = $(this);
                count < 4 ? count++ : count = 1;
                switch(count) {
                    case 1 : volumeBtn(1,1);break;
                    case 2 : volumeBtn(0.7,2);break;
                    case 3 : volumeBtn(0.4,3);break;
                    case 4 : volumeBtn(0,4);break;
                }
                function volumeBtn (val,id) {
                    _self.audioEle.volume = val;
                    __.find('span').hide();
                    __.find('span.audio-volume-btn'+id).show().css('display','block');
                }
            }).on('click', 'div.audio-progress-wrap', function () {
                _self.audioEle.seeked();
            });
        },
        addListenTouch : function () {
            var _self = this;
            this.startX = 0;
            this.x = 0;
            this.aboveX = 0;
            $(this.mainWrap).on('touchstart', 'span.audio-progress-btn', function (e) {
                _self.touchStart(e);
            }).on('touchmove', 'span.audio-progress-btn', function (e) {
                _self.touchMove(e);
            }).on('touchend', 'span.audio-progress-btn', function (e) {
                _self.touchEnd(e);
            });
            // var drag = document.getElementById("drag");
            // var speed = document.getElementById("speed");
        },
        //touchstart,touchmove,touchend事件函数
        touchStart : function (e) {  
            e.preventDefault();
            console.log(e);
            var touch = e.touches[0];
            this.startX = touch.pageX; 
        },
        touchMove : function (e) { //滑动  
            var _self = this;        
            e.preventDefault();
            var touch = e.touches[0];
            this.x = touch.pageX - this.startX; //滑动的距离
             //drag.style.webkitTransform = 'translate(' + 0+ 'px, ' + y + 'px)';  //也可以用css3的方式     
            // drag.style.left = aboveX + x + "px"; //  
            // speed.style.left = -((window.innerWidth) - (aboveX + x)) + "px";
            var w = $(this.mainWrap).find('div.audio-progress').width();
            _self.animateFn(_self.x+w);
        },
        touchEnd : function (e) { //手指离开屏幕
            var _self = this;
            e.preventDefault();
            aboveX = parseInt($(_self.mainWrap).find('div.audio-progress').width());
            var touch = e.touches[0];
            // var dragPaddingLeft = drag.style.left;
            // var change = dragPaddingLeft.replace("px", "");
            // numDragpaddingLeft = parseInt(change);
            var currentTime = (aboveX / _self.total) * _self.duration;//30是拖动圆圈的长度，减掉是为了让歌曲结束的时候不会跑到window以外
            _self.currentTime = currentTime;
        },
        //3拖动的滑动条前进
        // function dragMove() {
        //     setInterval(function() {
        //         drag.style.left = (audio.currentTime / audio.duration) * (window.innerWidth - 30) + "px";
        //         speed.style.left = -((window.innerWidth) - (audio.currentTime / audio.duration) * (window.innerWidth - 30)) + "px";
        //     }, 500);
        // }
    });

    //render html
    $.extend(plugin.prototype, {
        renderView : function () {
            $(this.mainWrap).html(this.setHtml());
        },
        setHtml : function () {
            var html = '<div class="audio-wrap clearfix">'+
                            '<button class="fl audio-control-wrap audio-play-btn">'+
                                '<span></span>'+
                            '</button>'+
                            '<button class="fl audio-control-wrap audio-pause-btn">'+
                                '<span></span>'+
                            '</button>'+
                            '<div class="fl audio-progress-wrap">'+
                                '<div class="audio-progress"></div>'+
                                '<span class="audio-progress-btn"></span>'+
                            '</div>'+
                            '<div class="fl audio-time-txt">'+
                                '<p><span nt="current-time">00:00:00</span>/<span nt="total-time">00:00:00</span></p>'+
                            '</div>'+
                            '<button class="fr audio-voice-wrap">'+
                                '<span class="audio-volume-btn1"></span>'+
                                '<span class="audio-volume-btn2"></span>'+
                                '<span class="audio-volume-btn3"></span>'+
                                '<span class="audio-volume-btn4"></span>'+
                            '</button>'+
                        '</div>';
            return html;
        }
    });

    return function(config){
        return audios = new plugin(config);
    };
});