/*==================================================
 *  Simile Timeplot API
 *
 *  Include Timeplot in your HTML file as follows:
 *    <script src="http://static.simile.mit.edu/timeplot/api/1.0/timeplot-api.js" type="text/javascript"></script>
 *
 *==================================================*/

(function() {

    var local = false;

    // obtain local mode from the document URL    
    if (document.location.search.length > 0) {
        var params = document.location.search.substr(1).split("&");
        for (var i = 0; i < params.length; i++) {
            if (params[i] == "local") {
                local = true;
            }
        }
    }

    // obtain local mode from the script URL params attribute
    if (!local) {
        var heads = document.documentElement.getElementsByTagName("head");
        for (var h = 0; h < heads.length; h++) {
            var node = heads[h].firstChild;
            while (node != null) {
                if (node.nodeType == 1 && node.tagName.toLowerCase() == "script") {
                    var url = node.src;
                    if (url.indexOf("timeplot-api") >= 0) {
                        local = (url.indexOf("local") >= 0);
                    }
                }
                node = node.nextSibling;
            }
        }
    }

    // Load Timeplot if it's not already loaded (after SimileAjax and Timeline)
    var loadTimeplot = function() {

        if (typeof window.Timeplot != "undefined") {
            return;
        }
        
        window.Timeplot = {
            loaded:     false,
            params:     { bundle: true, autoCreate: true },
            namespace:  "http://simile.mit.edu/2007/06/timeplot#",
            importers:  {}
        };
    
        var javascriptFiles = [
            "timeplot.js",
            "plot.js",
            "sources.js",
            "geometry.js",
            "color.js",
            "math.js",
            "processor.js"
        ];
        var cssFiles = [
            "timeplot.css"
        ];
        
        var locales = [ "en" ];

        var defaultClientLocales = ("language" in navigator ? navigator.language : navigator.browserLanguage).split(";");
        for (var l = 0; l < defaultClientLocales.length; l++) {
            var locale = defaultClientLocales[l];
            if (locale != "en") {
                var segments = locale.split("-");
                if (segments.length > 1 && segments[0] != "en") {
                    locales.push(segments[0]);
                }
                locales.push(locale);
            }
        }

        var paramTypes = { bundle:Boolean, js:Array, css:Array, autoCreate:Boolean };
        if (typeof Timeplot_urlPrefix == "string") {
            Timeplot.urlPrefix = Timeplot_urlPrefix;
            if ("Timeplot_parameters" in window) {
                SimileAjax.parseURLParameters(Timeplot_parameters, Timeplot.params, paramTypes);
            }
        } else {
            var url = SimileAjax.findScript(document, "/timeplot-api.js");
            if (url == null) {
                Timeplot.error = new Error("Failed to derive URL prefix for Simile Timeplot API code files");
                return;
            }
            Timeplot.urlPrefix = url.substr(0, url.indexOf("timeplot-api.js"));
        
            SimileAjax.parseURLParameters(url, Timeplot.params, paramTypes);
        }

        if (Timeplot.params.locale) { // ISO-639 language codes,
            // optional ISO-3166 country codes (2 characters)
            if (Timeplot.params.locale != "en") {
                var segments = Timeplot.params.locale.split("-");
                if (segments.length > 1 && segments[0] != "en") {
                    locales.push(segments[0]);
                }
                locales.push(Timeplot.params.locale);
            }
        }

        var timeplotURLPrefix = (local) ? "/static/timeplot_js/" : Timeplot.urlPrefix;

        if (local && !("console" in window)) {
            var firebug = [ timeplotURLPrefix + "lib/firebug/firebug.js" ];
            SimileAjax.includeJavascriptFiles(document, "", firebug);
        }
        
        var canvas = document.createElement("canvas");

        if (!canvas.getContext) {
            var excanvas = [ timeplotURLPrefix + "lib/excanvas.js" ];
            SimileAjax.includeJavascriptFiles(document, "", excanvas);
        }
        
        var scriptURLs = Timeplot.params.js || [];
        var cssURLs = Timeplot.params.css || [];

        // Core scripts and styles
        if (Timeplot.params.bundle) {
            scriptURLs.push(timeplotURLPrefix + "timeplot-bundle.js");
            cssURLs.push(timeplotURLPrefix + "timeplot-bundle.css");
        } else {
            SimileAjax.prefixURLs(scriptURLs, timeplotURLPrefix + "scripts/", javascriptFiles);
            SimileAjax.prefixURLs(cssURLs, timeplotURLPrefix + "styles/", cssFiles);
        }
        
        // Localization
        //for (var i = 0; i < locales.length; i++) {
        //    scriptURLs.push(Timeplot.urlPrefix + "locales/" + locales[i] + "/locale.js");
        //};
        
        window.SimileAjax_onLoad = function() {
            if (local && window.console.open) window.console.open();
            if (Timeplot.params.callback) {
                eval(Timeplot.params.callback + "()");
            }
        }
        
        SimileAjax.includeJavascriptFiles(document, "", scriptURLs);
        SimileAjax.includeCssFiles(document, "", cssURLs);
        Timeplot.loaded = true;
    };

    // Load Timeline if it's not already loaded (after SimileAjax and before Timeplot)
    var loadTimeline = function() {
        if (typeof Timeline != "undefined") {
            loadTimeplot();
        } else {
            var timelineURL = (local) ? "/timeline/api-2.0/timeline-api.js?bundle=false" : "http://static.simile.mit.edu/timeline/api-2.0/timeline-api.js";
            window.SimileAjax_onLoad = loadTimeplot;
            SimileAjax.includeJavascriptFile(document, timelineURL);
        }
    };
    
    // Load SimileAjax if it's not already loaded
    if (typeof SimileAjax == "undefined") {
        window.SimileAjax_onLoad = loadTimeline;
        
        var url = local ?
            "/ajax/api-2.0/simile-ajax-api.js?bundle=false" :
            "http://static.simile.mit.edu/ajax/api-2.0/simile-ajax-api.js?bundle=true";
                
        var createScriptElement = function() {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.language = "JavaScript";
            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
        }
        
        if (document.body == null) {
            try {
                document.write("<script src='" + url + "' type='text/javascript'></script>");
            } catch (e) {
                createScriptElement();
            }
        } else {
            createScriptElement();
        }
    } else {
        loadTimeline();
    }
})();

﻿

/* timeplot.js */
Timeline.Debug=SimileAjax.Debug;
var log=SimileAjax.Debug.log;
Object.extend=function(A,C){for(var B in C){A[B]=C[B];
}return A;
};
Timeplot.create=function(A,B){return new Timeplot._Impl(A,B);
};
Timeplot.createPlotInfo=function(A){return{id:("id" in A)?A.id:"p"+Math.round(Math.random()*1000000),dataSource:("dataSource" in A)?A.dataSource:null,eventSource:("eventSource" in A)?A.eventSource:null,timeGeometry:("timeGeometry" in A)?A.timeGeometry:new Timeplot.DefaultTimeGeometry(),valueGeometry:("valueGeometry" in A)?A.valueGeometry:new Timeplot.DefaultValueGeometry(),timeZone:("timeZone" in A)?A.timeZone:0,fillColor:("fillColor" in A)?((A.fillColor=="string")?new Timeplot.Color(A.fillColor):A.fillColor):null,fillGradient:("fillGradient" in A)?A.fillGradient:true,fillFrom:("fillFrom" in A)?A.fillFrom:Number.NEGATIVE_INFINITY,lineColor:("lineColor" in A)?((A.lineColor=="string")?new Timeplot.Color(A.lineColor):A.lineColor):new Timeplot.Color("#606060"),lineWidth:("lineWidth" in A)?A.lineWidth:1,dotRadius:("dotRadius" in A)?A.dotRadius:2,dotColor:("dotColor" in A)?A.dotColor:null,eventLineWidth:("eventLineWidth" in A)?A.eventLineWidth:1,showValues:("showValues" in A)?A.showValues:false,roundValues:("roundValues" in A)?A.roundValues:true,valuesOpacity:("valuesOpacity" in A)?A.valuesOpacity:75,bubbleWidth:("bubbleWidth" in A)?A.bubbleWidth:300,bubbleHeight:("bubbleHeight" in A)?A.bubbleHeight:200};
};
Timeplot._Impl=function(A,B){this._id="t"+Math.round(Math.random()*1000000);
this._containerDiv=A;
this._plotInfos=B;
this._painters={background:[],foreground:[]};
this._painter=null;
this._active=false;
this._upright=false;
this._initialize();
};
Timeplot._Impl.prototype={dispose:function(){for(var A=0;
A<this._plots.length;
A++){this._plots[A].dispose();
}this._plots=null;
this._plotsInfos=null;
this._containerDiv.innerHTML="";
},getElement:function(){return this._containerDiv;
},getDocument:function(){return this._containerDiv.ownerDocument;
},add:function(A){this._containerDiv.appendChild(A);
},remove:function(A){this._containerDiv.removeChild(A);
},addPainter:function(B,A){var D=this._painters[B];
if(D){for(var C=0;
C<D.length;
C++){if(D[C].context._id==A.context._id){return ;
}}D.push(A);
}},removePainter:function(B,A){var D=this._painters[B];
if(D){for(var C=0;
C<D.length;
C++){if(D[C].context._id==A.context._id){D.splice(C,1);
break;
}}}},getWidth:function(){return this._containerDiv.clientWidth;
},getHeight:function(){return this._containerDiv.clientHeight;
},getCanvas:function(){return this._canvas;
},loadText:function(A,G,D,C,F){if(this._active){var H=this;
var E=function(K,I,J){alert("Failed to load data xml from "+A+"\n"+K);
H.hideLoadingMessage();
};
var B=function(I){try{D.loadText(I.responseText,G,A,C,F);
}catch(J){SimileAjax.Debug.exception(J);
}finally{H.hideLoadingMessage();
}};
this.showLoadingMessage();
window.setTimeout(function(){SimileAjax.XmlHttp.get(A,E,B);
},0);
}},loadXML:function(B,D){if(this._active){var A=this;
var E=function(H,F,G){alert("Failed to load data xml from "+B+"\n"+H);
A.hideLoadingMessage();
};
var C=function(G){try{var F=G.responseXML;
if(!F.documentElement&&G.responseStream){F.load(G.responseStream);
}D.loadXML(F,B);
}finally{A.hideLoadingMessage();
}};
this.showLoadingMessage();
window.setTimeout(function(){SimileAjax.XmlHttp.get(B,E,C);
},0);
}},putText:function(E,C,A,B){var D=this.putDiv(E,"timeplot-div "+A,B);
D.innerHTML=C;
return D;
},putDiv:function(F,B,C){var D=this._id+"-"+F;
var E=document.getElementById(D);
if(!E){var A=this._containerDiv.firstChild;
E=document.createElement("div");
E.setAttribute("id",D);
A.appendChild(E);
}E.setAttribute("class","timeplot-div "+B);
E.setAttribute("className","timeplot-div "+B);
this.placeDiv(E,C);
return E;
},placeDiv:function(B,A){if(A){for(style in A){if(style=="left"){A[style]+=this._paddingX;
A[style]+="px";
}else{if(style=="right"){A[style]+=this._paddingX;
A[style]+="px";
}else{if(style=="top"){A[style]+=this._paddingY;
A[style]+="px";
}else{if(style=="bottom"){A[style]+=this._paddingY;
A[style]+="px";
}else{if(style=="width"){if(A[style]<0){A[style]=0;
}A[style]+="px";
}else{if(style=="height"){if(A[style]<0){A[style]=0;
}A[style]+="px";
}}}}}}B.style[style]=A[style];
}}},locate:function(A){return{x:A.offsetLeft-this._paddingX,y:A.offsetTop-this._paddingY};
},update:function(){if(this._active){for(var B=0;
B<this._plots.length;
B++){var C=this._plots[B];
var D=C.getDataSource();
if(D){var A=D.getRange();
if(A){C._valueGeometry.setRange(A);
C._timeGeometry.setRange(A);
}}C.hideValues();
}this.paint();
}},repaint:function(){if(this._active){this._prepareCanvas();
for(var A=0;
A<this._plots.length;
A++){var B=this._plots[A];
if(B._timeGeometry){B._timeGeometry.reset();
}if(B._valueGeometry){B._valueGeometry.reset();
}}this.paint();
}},paint:function(){if(this._active&&this._painter==null){var A=this;
this._painter=window.setTimeout(function(){A._clearCanvas();
var E=function(G,F){try{if(F.setTimeplot){F.setTimeplot(A);
}G.apply(F,[]);
}catch(H){SimileAjax.Debug.exception(H);
}};
var C=A._painters.background;
for(var B=0;
B<C.length;
B++){E(C[B].action,C[B].context);
}var D=A._painters.foreground;
for(var B=0;
B<D.length;
B++){E(D[B].action,D[B].context);
}A._painter=null;
},20);
}},_clearCanvas:function(){var B=this.getCanvas();
var A=B.getContext("2d");
A.clearRect(0,0,B.width,B.height);
},_clearLabels:function(){var A=this._containerDiv.firstChild;
if(A){this._containerDiv.removeChild(A);
}A=document.createElement("div");
this._containerDiv.appendChild(A);
},_prepareCanvas:function(){var C=this.getCanvas();
var B=SimileAjax.jQuery(this._containerDiv);
this._paddingX=(parseInt(B.css("paddingLeft"))+parseInt(B.css("paddingRight")))/2;
this._paddingY=(parseInt(B.css("paddingTop"))+parseInt(B.css("paddingBottom")))/2;
C.width=this.getWidth()-(this._paddingX*2);
C.height=this.getHeight()-(this._paddingY*2);
var A=C.getContext("2d");
this._setUpright(A,C);
A.globalCompositeOperation="source-over";
},_setUpright:function(A,B){if(!SimileAjax.Platform.browser.isIE){this._upright=false;
}if(!this._upright){this._upright=true;
A.translate(0,B.height);
A.scale(1,-1);
}},_isBrowserSupported:function(B){var A=SimileAjax.Platform.browser;
if((B.getContext&&window.getComputedStyle)||(A.isIE&&A.majorVersion>=6)){return true;
}else{return false;
}},_initialize:function(){SimileAjax.WindowManager.initialize();
var G=this._containerDiv;
var I=G.ownerDocument;
G.className="timeplot-container "+G.className;
while(G.firstChild){G.removeChild(G.firstChild);
}var B=I.createElement("canvas");
if(this._isBrowserSupported(B)){this._clearLabels();
this._canvas=B;
B.className="timeplot-canvas";
G.appendChild(B);
if(!B.getContext&&G_vmlCanvasManager){B=G_vmlCanvasManager.initElement(this._canvas);
this._canvas=B;
}this._prepareCanvas();
var C=SimileAjax.Graphics.createTranslucentImage(Timeplot.urlPrefix+"images/copyright.png");
C.className="timeplot-copyright";
C.title="Timeplot (c) SIMILE - http://simile.mit.edu/timeplot/";
SimileAjax.DOM.registerEvent(C,"click",function(){window.location="http://simile.mit.edu/timeplot/";
});
G.appendChild(C);
var E=this;
var H={onAddMany:function(){E.update();
},onClear:function(){E.update();
}};
this._plots=[];
if(this._plotInfos){for(var D=0;
D<this._plotInfos.length;
D++){var F=new Timeplot.Plot(this,this._plotInfos[D]);
var A=F.getDataSource();
if(A){A.addListener(H);
}this.addPainter("background",{context:F.getTimeGeometry(),action:F.getTimeGeometry().paint});
this.addPainter("background",{context:F.getValueGeometry(),action:F.getValueGeometry().paint});
this.addPainter("foreground",{context:F,action:F.paint});
this._plots.push(F);
F.initialize();
}}var J=SimileAjax.Graphics.createMessageBubble(I);
J.containerDiv.className="timeplot-message-container";
G.appendChild(J.containerDiv);
J.contentDiv.className="timeplot-message";
J.contentDiv.innerHTML="<img src='"+Timeplot.urlPrefix+"images/progress-running.gif' /> Loading...";
this.showLoadingMessage=function(){J.containerDiv.style.display="block";
};
this.hideLoadingMessage=function(){J.containerDiv.style.display="none";
};
this._active=true;
}else{this._message=SimileAjax.Graphics.createMessageBubble(I);
this._message.containerDiv.className="timeplot-message-container";
this._message.containerDiv.style.top="15%";
this._message.containerDiv.style.left="20%";
this._message.containerDiv.style.right="20%";
this._message.containerDiv.style.minWidth="20em";
this._message.contentDiv.className="timeplot-message";
this._message.contentDiv.innerHTML="We're terribly sorry, but your browser is not currently supported by <a href='http://simile.mit.edu/timeplot/'>Timeplot</a>.<br><br> We are working on supporting it in the near future but, for now, see the <a href='http://simile.mit.edu/wiki/Timeplot_Limitations'>list of currently supported browsers</a>.";
this._message.containerDiv.style.display="block";
G.appendChild(this._message.containerDiv);
}}};


/* plot.js */
Timeplot.Plot=function(A,B){this._timeplot=A;
this._canvas=A.getCanvas();
this._plotInfo=B;
this._id=B.id;
this._timeGeometry=B.timeGeometry;
this._valueGeometry=B.valueGeometry;
this._theme=new Timeline.getDefaultTheme();
this._dataSource=B.dataSource;
this._eventSource=B.eventSource;
this._bubble=null;
};
Timeplot.Plot.prototype={initialize:function(){if(this._dataSource&&this._dataSource.getValue){this._timeFlag=this._timeplot.putDiv("timeflag","timeplot-timeflag");
this._valueFlag=this._timeplot.putDiv(this._id+"valueflag","timeplot-valueflag");
this._valueFlagLineLeft=this._timeplot.putDiv(this._id+"valueflagLineLeft","timeplot-valueflag-line");
this._valueFlagLineRight=this._timeplot.putDiv(this._id+"valueflagLineRight","timeplot-valueflag-line");
if(!this._valueFlagLineLeft.firstChild){this._valueFlagLineLeft.appendChild(SimileAjax.Graphics.createTranslucentImage(Timeplot.urlPrefix+"images/line_left.png"));
this._valueFlagLineRight.appendChild(SimileAjax.Graphics.createTranslucentImage(Timeplot.urlPrefix+"images/line_right.png"));
}this._valueFlagPole=this._timeplot.putDiv(this._id+"valuepole","timeplot-valueflag-pole");
var D=this._plotInfo.valuesOpacity;
SimileAjax.Graphics.setOpacity(this._timeFlag,D);
SimileAjax.Graphics.setOpacity(this._valueFlag,D);
SimileAjax.Graphics.setOpacity(this._valueFlagLineLeft,D);
SimileAjax.Graphics.setOpacity(this._valueFlagLineRight,D);
SimileAjax.Graphics.setOpacity(this._valueFlagPole,D);
var F=this;
var G=function(I,H,J){if(F._plotInfo.showValues){F._valueFlag.style.display="block";
A(I,H,J);
}};
var B=24*60*60*1000;
var E=30*B;
var A=function(J,V,O){if(typeof SimileAjax!="undefined"&&F._plotInfo.showValues){var Q=F._canvas;
var T=Math.round(SimileAjax.DOM.getEventRelativeCoordinates(V,F._canvas).x);
if(T>Q.width){T=Q.width;
}if(isNaN(T)||T<0){T=0;
}var W=F._timeGeometry.fromScreen(T);
if(W==0){F._valueFlag.style.display="none";
return ;
}var U=F._dataSource.getValue(W);
if(F._plotInfo.roundValues){U=Math.round(U);
}F._valueFlag.innerHTML=new String(U);
var P=new Date(W);
var I=F._timeGeometry.getPeriod();
if(I<B){F._timeFlag.innerHTML=P.toLocaleTimeString();
}else{if(I>E){F._timeFlag.innerHTML=P.toLocaleDateString();
}else{F._timeFlag.innerHTML=P.toLocaleString();
}}var N=F._timeFlag.clientWidth;
var H=F._timeFlag.clientHeight;
var K=Math.round(N/2);
var S=F._valueFlag.clientWidth;
var M=F._valueFlag.clientHeight;
var R=F._valueGeometry.toScreen(U);
if(T+K>Q.width){var L=Q.width-K;
}else{if(T-K<0){var L=K;
}else{var L=T;
}}if(F._timeGeometry._timeValuePosition=="top"){F._timeplot.placeDiv(F._valueFlagPole,{left:T,top:H-5,height:Q.height-R-H+6,display:"block"});
F._timeplot.placeDiv(F._timeFlag,{left:L-K,top:-6,display:"block"});
}else{F._timeplot.placeDiv(F._valueFlagPole,{left:T,bottom:H-5,height:R-H+6,display:"block"});
F._timeplot.placeDiv(F._timeFlag,{left:L-K,bottom:-6,display:"block"});
}if(T+S+14>Q.width&&R+M+4>Q.height){F._valueFlagLineLeft.style.display="none";
F._timeplot.placeDiv(F._valueFlagLineRight,{left:T-14,bottom:R-14,display:"block"});
F._timeplot.placeDiv(F._valueFlag,{left:T-S-13,bottom:R-M-13,display:"block"});
}else{if(T+S+14>Q.width&&R+M+4<Q.height){F._valueFlagLineRight.style.display="none";
F._timeplot.placeDiv(F._valueFlagLineLeft,{left:T-14,bottom:R,display:"block"});
F._timeplot.placeDiv(F._valueFlag,{left:T-S-13,bottom:R+13,display:"block"});
}else{if(T+S+14<Q.width&&R+M+4>Q.height){F._valueFlagLineRight.style.display="none";
F._timeplot.placeDiv(F._valueFlagLineLeft,{left:T,bottom:R-13,display:"block"});
F._timeplot.placeDiv(F._valueFlag,{left:T+13,bottom:R-13,display:"block"});
}else{F._valueFlagLineLeft.style.display="none";
F._timeplot.placeDiv(F._valueFlagLineRight,{left:T,bottom:R,display:"block"});
F._timeplot.placeDiv(F._valueFlag,{left:T+13,bottom:R+13,display:"block"});
}}}}};
var C=this._timeplot.getElement();
SimileAjax.DOM.registerEvent(C,"mouseover",G);
SimileAjax.DOM.registerEvent(C,"mousemove",A);
}},dispose:function(){if(this._dataSource){this._dataSource.removeListener(this._paintingListener);
this._paintingListener=null;
this._dataSource.dispose();
this._dataSource=null;
}},hideValues:function(){if(this._valueFlag){this._valueFlag.style.display="none";
}if(this._timeFlag){this._timeFlag.style.display="none";
}if(this._valueFlagLineLeft){this._valueFlagLineLeft.style.display="none";
}if(this._valueFlagLineRight){this._valueFlagLineRight.style.display="none";
}if(this._valueFlagPole){this._valueFlagPole.style.display="none";
}},getDataSource:function(){return(this._dataSource)?this._dataSource:this._eventSource;
},getTimeGeometry:function(){return this._timeGeometry;
},getValueGeometry:function(){return this._valueGeometry;
},paint:function(){var M=this._canvas.getContext("2d");
M.lineWidth=this._plotInfo.lineWidth;
M.lineJoin="miter";
if(this._dataSource){if(this._plotInfo.fillColor){if(this._plotInfo.fillGradient){var A=M.createLinearGradient(0,this._canvas.height,0,0);
A.addColorStop(0,this._plotInfo.fillColor.toString());
A.addColorStop(0.5,this._plotInfo.fillColor.toString());
A.addColorStop(1,"rgba(255,255,255,0)");
M.fillStyle=A;
}else{M.fillStyle=this._plotInfo.fillColor.toString();
}M.beginPath();
M.moveTo(0,0);
this._plot(function(T,U){M.lineTo(T,U);
});
if(this._plotInfo.fillFrom==Number.NEGATIVE_INFINITY){M.lineTo(this._canvas.width,0);
}else{if(this._plotInfo.fillFrom==Number.POSITIVE_INFINITY){M.lineTo(this._canvas.width,this._canvas.height);
M.lineTo(0,this._canvas.height);
}else{M.lineTo(this._canvas.width,this._valueGeometry.toScreen(this._plotInfo.fillFrom));
M.lineTo(0,this._valueGeometry.toScreen(this._plotInfo.fillFrom));
}}M.fill();
}if(this._plotInfo.lineColor){M.strokeStyle=this._plotInfo.lineColor.toString();
M.beginPath();
var F=true;
this._plot(function(T,U){if(F){F=false;
M.moveTo(T,U);
}M.lineTo(T,U);
});
M.stroke();
}if(this._plotInfo.dotColor){M.fillStyle=this._plotInfo.dotColor.toString();
var K=this._plotInfo.dotRadius;
this._plot(function(T,U){M.beginPath();
M.arc(T,U,K,0,2*Math.PI,true);
M.fill();
});
}}if(this._eventSource){var A=M.createLinearGradient(0,0,0,this._canvas.height);
A.addColorStop(1,"rgba(255,255,255,0)");
M.strokeStyle=A;
M.fillStyle=A;
M.lineWidth=this._plotInfo.eventLineWidth;
M.lineJoin="miter";
var Q=this._eventSource.getAllEventIterator();
while(Q.hasNext()){var P=Q.next();
var N=P.getColor();
N=(N)?new Timeplot.Color(N):this._plotInfo.lineColor;
var B=P.getStart().getTime();
var R=P.getEnd().getTime();
if(B==R){var S=N.toString();
A.addColorStop(0,S);
var E=this._timeGeometry.toScreen(B);
E=Math.floor(E)+0.5;
var C=E;
M.beginPath();
M.moveTo(E,0);
M.lineTo(E,this._canvas.height);
M.stroke();
var G=E-4;
var I=7;
}else{var S=N.toString(0.5);
A.addColorStop(0,S);
var E=this._timeGeometry.toScreen(B);
E=Math.floor(E)+0.5;
var C=this._timeGeometry.toScreen(R);
C=Math.floor(C)+0.5;
M.fillRect(E,0,C-E,this._canvas.height);
var G=E;
var I=C-E-1;
}var J=this._timeplot.putDiv(P.getID(),"timeplot-event-box",{left:Math.round(G),width:Math.round(I),top:0,height:this._canvas.height-1});
var O=this;
var H=function(T){return function(W,U,Z){var Y=O._timeplot.getDocument();
O._closeBubble();
var X=SimileAjax.DOM.getEventPageCoordinates(U);
var V=SimileAjax.DOM.getPageCoordinates(W);
O._bubble=SimileAjax.Graphics.createBubbleForPoint(X.x,V.top+O._canvas.height,O._plotInfo.bubbleWidth,O._plotInfo.bubbleHeight,"bottom");
T.fillInfoBubble(O._bubble.content,O._theme,O._timeGeometry.getLabeler());
};
};
var D=function(U,T,V){U.oldClass=U.className;
U.className=U.className+" timeplot-event-box-highlight";
};
var L=function(U,T,V){U.className=U.oldClass;
U.oldClass=null;
};
if(!J.instrumented){SimileAjax.DOM.registerEvent(J,"click",H(P));
SimileAjax.DOM.registerEvent(J,"mouseover",D);
SimileAjax.DOM.registerEvent(J,"mouseout",L);
J.instrumented=true;
}}}},_plot:function(F){var E=this._dataSource.getData();
if(E){var G=E.times;
var B=E.values;
var C=G.length;
for(var D=0;
D<C;
D++){var A=this._timeGeometry.toScreen(G[D]);
var H=this._valueGeometry.toScreen(B[D]);
F(A,H);
}}},_closeBubble:function(){if(this._bubble!=null){this._bubble.close();
this._bubble=null;
}}};


/* sources.js */
Timeplot.DefaultEventSource=function(A){Timeline.DefaultEventSource.apply(this,arguments);
};
Object.extend(Timeplot.DefaultEventSource.prototype,Timeline.DefaultEventSource.prototype);
Timeplot.DefaultEventSource.prototype.loadText=function(M,I,A,C,K){if(M==null){return ;
}this._events.maxValues=new Array();
var B=this._getBaseURL(A);
if(!K){K="iso8601";
}var H=this._events.getUnit().getParser(K);
var G=this._parseText(M,I);
var J=false;
if(C){G=C(G);
}if(G){for(var F=0;
F<G.length;
F++){var N=G[F];
if(N.length>1){var E=SimileAjax.jQuery.trim(N[0]);
var D=H(E);
if(D){var L=new Timeplot.DefaultEventSource.NumericEvent(D,N.slice(1));
this._events.add(L);
J=true;
}}}}if(J){this._fire("onAddMany",[]);
}};
Timeplot.DefaultEventSource.prototype._parseText=function(H,C){H=H.replace(/\r\n?/g,"\n");
var F=0;
var E=H.length;
var I=[];
while(F<E){var J=[];
if(H.charAt(F)!="#"){while(F<E){if(H.charAt(F)=='"'){var A=H.indexOf('"',F+1);
while(A<E&&A>-1){if(H.charAt(A+1)!='"'){break;
}A=H.indexOf('"',A+2);
}if(A<0){}else{if(H.charAt(A+1)==C){var B=H.substr(F+1,A-F-1);
B=B.replace(/""/g,'"');
J[J.length]=B;
F=A+2;
continue;
}else{if(H.charAt(A+1)=="\n"||E==A+1){var B=H.substr(F+1,A-F-1);
B=B.replace(/""/g,'"');
J[J.length]=B;
F=A+2;
break;
}else{}}}}var G=H.indexOf(C,F);
var D=H.indexOf("\n",F);
if(D<0){D=E;
}if(G>-1&&G<D){J[J.length]=H.substr(F,G-F);
F=G+1;
}else{J[J.length]=H.substr(F,D-F);
F=D+1;
break;
}}}else{var D=H.indexOf("\n",F);
F=(D>-1)?D+1:cur;
}if(J.length>0){I[I.length]=J;
}}if(I.length<0){return ;
}return I;
};
Timeplot.DefaultEventSource.prototype.getRange=function(){var A=this.getEarliestDate();
var B=this.getLatestDate();
return{earliestDate:(A)?A:null,latestDate:(B)?B:null,min:0,max:0};
};
Timeplot.DefaultEventSource.NumericEvent=function(B,A){this._id="e"+Math.round(Math.random()*1000000);
this._time=B;
this._values=A;
};
Timeplot.DefaultEventSource.NumericEvent.prototype={getID:function(){return this._id;
},getTime:function(){return this._time;
},getValues:function(){return this._values;
},getStart:function(){return this._time;
},getEnd:function(){return this._time;
}};
Timeplot.DataSource=function(B){this._eventSource=B;
var A=this;
this._processingListener={onAddMany:function(){A._process();
},onClear:function(){A._clear();
}};
this.addListener(this._processingListener);
this._listeners=[];
this._data=null;
this._range=null;
};
Timeplot.DataSource.prototype={_clear:function(){this._data=null;
this._range=null;
},_process:function(){this._data={times:new Array(),values:new Array()};
this._range={earliestDate:null,latestDate:null,min:0,max:0};
},getRange:function(){return this._range;
},getData:function(){return this._data;
},getValue:function(C){if(this._data){for(var B=0;
B<this._data.times.length;
B++){var A=this._data.times[B];
if(A>=C){return this._data.values[B];
}}}return 0;
},addListener:function(A){this._eventSource.addListener(A);
},removeListener:function(A){this._eventSource.removeListener(A);
},replaceListener:function(A,B){this.removeListener(A);
this.addListener(B);
}};
Timeplot.ColumnSource=function(B,A){Timeplot.DataSource.apply(this,arguments);
this._column=A-1;
};
Object.extend(Timeplot.ColumnSource.prototype,Timeplot.DataSource.prototype);
Timeplot.ColumnSource.prototype.dispose=function(){this.removeListener(this._processingListener);
this._clear();
};
Timeplot.ColumnSource.prototype._process=function(){var G=this._eventSource.getCount();
var A=new Array(G);
var J=new Array(G);
var D=Number.MAX_VALUE;
var H=Number.MIN_VALUE;
var E=0;
var F=this._eventSource.getAllEventIterator();
while(F.hasNext()){var B=F.next();
var C=B.getTime();
A[E]=C;
var I=this._getValue(B);
if(!isNaN(I)){if(I<D){D=I;
}if(I>H){H=I;
}J[E]=I;
}E++;
}this._data={times:A,values:J};
if(H==Number.MIN_VALUE){H=1;
}this._range={earliestDate:this._eventSource.getEarliestDate(),latestDate:this._eventSource.getLatestDate(),min:D,max:H};
};
Timeplot.ColumnSource.prototype._getValue=function(A){return parseFloat(A.getValues()[this._column]);
};
Timeplot.ColumnDiffSource=function(C,B,A){Timeplot.ColumnSource.apply(this,arguments);
this._column2=A-1;
};
Object.extend(Timeplot.ColumnDiffSource.prototype,Timeplot.ColumnSource.prototype);
Timeplot.ColumnDiffSource.prototype._getValue=function(C){var B=parseFloat(C.getValues()[this._column]);
var A=parseFloat(C.getValues()[this._column2]);
return B-A;
};


/* geometry.js */
Timeplot.DefaultValueGeometry=function(A){if(!A){A={};
}this._id=("id" in A)?A.id:"g"+Math.round(Math.random()*1000000);
this._axisColor=("axisColor" in A)?((typeof A.axisColor=="string")?new Timeplot.Color(A.axisColor):A.axisColor):new Timeplot.Color("#606060"),this._gridColor=("gridColor" in A)?((typeof A.gridColor=="string")?new Timeplot.Color(A.gridColor):A.gridColor):null,this._gridLineWidth=("gridLineWidth" in A)?A.gridLineWidth:0.5;
this._axisLabelsPlacement=("axisLabelsPlacement" in A)?A.axisLabelsPlacement:"right";
this._gridSpacing=("gridSpacing" in A)?A.gridStep:50;
this._gridType=("gridType" in A)?A.gridType:"short";
this._gridShortSize=("gridShortSize" in A)?A.gridShortSize:10;
this._minValue=("min" in A)?A.min:null;
this._maxValue=("max" in A)?A.max:null;
this._linMap={direct:function(B){return B;
},inverse:function(B){return B;
}};
this._map=this._linMap;
this._labels=[];
this._grid=[];
};
Timeplot.DefaultValueGeometry.prototype={setTimeplot:function(A){this._timeplot=A;
this._canvas=A.getCanvas();
this.reset();
},setRange:function(A){if((this._minValue==null)||((this._minValue!=null)&&(A.min<this._minValue))){this._minValue=A.min;
}if((this._maxValue==null)||((this._maxValue!=null)&&(A.max*1.05>this._maxValue))){this._maxValue=A.max*1.05;
}this._updateMappedValues();
if(!(this._minValue==0&&this._maxValue==0)){this._grid=this._calculateGrid();
}},reset:function(){this._clearLabels();
this._updateMappedValues();
this._grid=this._calculateGrid();
},toScreen:function(B){if(this._canvas&&this._maxValue){var A=B-this._minValue;
return this._canvas.height*(this._map.direct(A))/this._mappedRange;
}else{return -50;
}},fromScreen:function(A){if(this._canvas){return this._map.inverse(this._mappedRange*A/this._canvas.height)+this._minValue;
}else{return 0;
}},paint:function(){if(this._timeplot){var B=this._canvas.getContext("2d");
B.lineJoin="miter";
if(this._gridColor){var E=B.createLinearGradient(0,0,0,this._canvas.height);
E.addColorStop(0,this._gridColor.toHexString());
E.addColorStop(0.3,this._gridColor.toHexString());
E.addColorStop(1,"rgba(255,255,255,0.5)");
B.lineWidth=this._gridLineWidth;
B.strokeStyle=E;
for(var D=0;
D<this._grid.length;
D++){var C=this._grid[D];
var G=Math.floor(C.y)+0.5;
if(typeof C.label!="undefined"){if(this._axisLabelsPlacement=="left"){var F=this._timeplot.putText(this._id+"-"+D,C.label,"timeplot-grid-label",{left:4,bottom:G+2,color:this._gridColor.toHexString(),visibility:"hidden"});
}else{if(this._axisLabelsPlacement=="right"){var F=this._timeplot.putText(this._id+"-"+D,C.label,"timeplot-grid-label",{right:4,bottom:G+2,color:this._gridColor.toHexString(),visibility:"hidden"});
}}if(G+F.clientHeight<this._canvas.height+10){F.style.visibility="visible";
}}B.beginPath();
if(this._gridType=="long"||C.label==0){B.moveTo(0,G);
B.lineTo(this._canvas.width,G);
}else{if(this._gridType=="short"){if(this._axisLabelsPlacement=="left"){B.moveTo(0,G);
B.lineTo(this._gridShortSize,G);
}else{if(this._axisLabelsPlacement=="right"){B.moveTo(this._canvas.width,G);
B.lineTo(this._canvas.width-this._gridShortSize,G);
}}}}B.stroke();
}}var A=B.createLinearGradient(0,0,0,this._canvas.height);
A.addColorStop(0,this._axisColor.toString());
A.addColorStop(0.5,this._axisColor.toString());
A.addColorStop(1,"rgba(255,255,255,0.5)");
B.lineWidth=1;
B.strokeStyle=A;
B.beginPath();
B.moveTo(0,this._canvas.height);
B.lineTo(0,0);
B.stroke();
B.beginPath();
B.moveTo(this._canvas.width,0);
B.lineTo(this._canvas.width,this._canvas.height);
B.stroke();
}},_clearLabels:function(){for(var B=0;
B<this._labels.length;
B++){var A=this._labels[B];
var C=A.parentNode;
if(C){C.removeChild(A);
}}},_calculateGrid:function(){var C=[];
if(!this._canvas||this._valueRange==0){return C;
}var D=0;
if(this._valueRange>1){while(Math.pow(10,D)<this._valueRange){D++;
}D--;
}else{while(Math.pow(10,D)>this._valueRange){D--;
}}var E=Math.pow(10,D);
var F=E;
while(true){var A=this.toScreen(this._minValue+F);
while(A<this._gridSpacing){F+=E;
A=this.toScreen(this._minValue+F);
}if(A>2*this._gridSpacing){E/=10;
F=E;
}else{break;
}}var B=0;
var G=this.toScreen(B);
if(this._minValue>=0){while(G<this._canvas.height){if(G>0){C.push({y:G,label:B});
}B+=F;
G=this.toScreen(B);
}}else{if(this._maxValue<=0){while(G>0){if(G<this._canvas.height){C.push({y:G,label:B});
}B-=F;
G=this.toScreen(B);
}}else{while(G<this._canvas.height){if(G>0){C.push({y:G,label:B});
}B+=F;
G=this.toScreen(B);
}B=-F;
G=this.toScreen(B);
while(G>0){if(G<this._canvas.height){C.push({y:G,label:B});
}B-=F;
G=this.toScreen(B);
}}}return C;
},_updateMappedValues:function(){this._valueRange=Math.abs(this._maxValue-this._minValue);
this._mappedRange=this._map.direct(this._valueRange);
}};
Timeplot.LogarithmicValueGeometry=function(A){Timeplot.DefaultValueGeometry.apply(this,arguments);
this._logMap={direct:function(B){return Math.log(B+1)/Math.log(10);
},inverse:function(B){return Math.exp(Math.log(10)*B)-1;
}};
this._mode="log";
this._map=this._logMap;
this._calculateGrid=this._logarithmicCalculateGrid;
};
Timeplot.LogarithmicValueGeometry.prototype._linearCalculateGrid=Timeplot.DefaultValueGeometry.prototype._calculateGrid;
Object.extend(Timeplot.LogarithmicValueGeometry.prototype,Timeplot.DefaultValueGeometry.prototype);
Timeplot.LogarithmicValueGeometry.prototype._logarithmicCalculateGrid=function(){var B=[];
if(!this._canvas||this._valueRange==0){return B;
}var A=1;
var C=this.toScreen(A);
while(C<this._canvas.height||isNaN(C)){if(C>0){B.push({y:C,label:A});
}A*=10;
C=this.toScreen(A);
}return B;
};
Timeplot.LogarithmicValueGeometry.prototype.actLinear=function(){this._mode="lin";
this._map=this._linMap;
this._calculateGrid=this._linearCalculateGrid;
this.reset();
};
Timeplot.LogarithmicValueGeometry.prototype.actLogarithmic=function(){this._mode="log";
this._map=this._logMap;
this._calculateGrid=this._logarithmicCalculateGrid;
this.reset();
};
Timeplot.LogarithmicValueGeometry.prototype.toggle=function(){if(this._mode=="log"){this.actLinear();
}else{this.actLogarithmic();
}};
Timeplot.DefaultTimeGeometry=function(B){if(!B){B={};
}this._id=("id" in B)?B.id:"g"+Math.round(Math.random()*1000000);
this._locale=("locale" in B)?B.locale:"en";
this._timeZone=("timeZone" in B)?B.timeZone:SimileAjax.DateTime.getTimezone();
this._labeller=("labeller" in B)?B.labeller:null;
this._axisColor=("axisColor" in B)?((B.axisColor=="string")?new Timeplot.Color(B.axisColor):B.axisColor):new Timeplot.Color("#606060"),this._gridColor=("gridColor" in B)?((B.gridColor=="string")?new Timeplot.Color(B.gridColor):B.gridColor):null,this._gridLineWidth=("gridLineWidth" in B)?B.gridLineWidth:0.5;
this._axisLabelsPlacement=("axisLabelsPlacement" in B)?B.axisLabelsPlacement:"bottom";
this._gridStep=("gridStep" in B)?B.gridStep:100;
this._gridStepRange=("gridStepRange" in B)?B.gridStepRange:20;
this._min=("min" in B)?B.min:null;
this._max=("max" in B)?B.max:null;
this._timeValuePosition=("timeValuePosition" in B)?B.timeValuePosition:"bottom";
this._unit=("unit" in B)?B.unit:Timeline.NativeDateUnit;
this._linMap={direct:function(C){return C;
},inverse:function(C){return C;
}};
this._map=this._linMap;
this._labeler=this._unit.createLabeller(this._locale,this._timeZone);
var A=this._unit.getParser("iso8601");
if(this._min&&!this._min.getTime){this._min=A(this._min);
}if(this._max&&!this._max.getTime){this._max=A(this._max);
}this._grid=[];
};
Timeplot.DefaultTimeGeometry.prototype={setTimeplot:function(A){this._timeplot=A;
this._canvas=A.getCanvas();
this.reset();
},setRange:function(A){if(this._min){this._earliestDate=this._min;
}else{if(A.earliestDate&&((this._earliestDate==null)||((this._earliestDate!=null)&&(A.earliestDate.getTime()<this._earliestDate.getTime())))){this._earliestDate=A.earliestDate;
}}if(this._max){this._latestDate=this._max;
}else{if(A.latestDate&&((this._latestDate==null)||((this._latestDate!=null)&&(A.latestDate.getTime()>this._latestDate.getTime())))){this._latestDate=A.latestDate;
}}if(!this._earliestDate&&!this._latestDate){this._grid=[];
}else{this.reset();
}},reset:function(){this._updateMappedValues();
if(this._canvas){this._grid=this._calculateGrid();
}},toScreen:function(B){if(this._canvas&&this._latestDate){var A=B-this._earliestDate.getTime();
return this._canvas.width*this._map.direct(A)/this._mappedPeriod;
}else{return -50;
}},fromScreen:function(A){if(this._canvas){return this._map.inverse(this._mappedPeriod*A/this._canvas.width)+this._earliestDate.getTime();
}else{return 0;
}},getPeriod:function(){return this._period;
},getLabeler:function(){return this._labeler;
},getUnit:function(){return this._unit;
},paint:function(){if(this._canvas){var E=this._unit;
var B=this._canvas.getContext("2d");
var F=B.createLinearGradient(0,0,0,this._canvas.height);
B.strokeStyle=F;
B.lineWidth=this._gridLineWidth;
B.lineJoin="miter";
if(this._gridColor){F.addColorStop(0,this._gridColor.toString());
F.addColorStop(1,"rgba(255,255,255,0.9)");
for(var D=0;
D<this._grid.length;
D++){var C=this._grid[D];
var A=Math.floor(C.x)+0.5;
if(this._axisLabelsPlacement=="top"){var G=this._timeplot.putText(this._id+"-"+D,C.label,"timeplot-grid-label",{left:A+4,top:2,visibility:"hidden"});
}else{if(this._axisLabelsPlacement=="bottom"){var G=this._timeplot.putText(this._id+"-"+D,C.label,"timeplot-grid-label",{left:A+4,bottom:2,visibility:"hidden"});
}}if(A+G.clientWidth<this._canvas.width+10){G.style.visibility="visible";
}B.beginPath();
B.moveTo(A,0);
B.lineTo(A,this._canvas.height);
B.stroke();
}}F.addColorStop(0,this._axisColor.toString());
F.addColorStop(1,"rgba(255,255,255,0.5)");
B.lineWidth=1;
F.addColorStop(0,this._axisColor.toString());
B.beginPath();
B.moveTo(0,0);
B.lineTo(this._canvas.width,0);
B.stroke();
}},_calculateGrid:function(){var A=[];
var D=SimileAjax.DateTime;
var H=this._unit;
var B=this._period;
if(B==0){return A;
}if(B>D.gregorianUnitLengths[D.MILLENNIUM]){G=D.MILLENNIUM;
}else{for(var G=D.MILLENNIUM;
G>0;
G--){if(D.gregorianUnitLengths[G-1]<=B&&B<D.gregorianUnitLengths[G]){G--;
break;
}}}var I=H.cloneValue(this._earliestDate);
do{D.roundDownToInterval(I,G,this._timeZone,1,0);
var F=this.toScreen(H.toNumber(I));
switch(G){case D.SECOND:var E=I.toLocaleTimeString();
break;
case D.MINUTE:var C=I.getMinutes();
var E=I.getHours()+":"+((C<10)?"0":"")+C;
break;
case D.HOUR:var E=I.getHours()+":00";
break;
case D.DAY:case D.WEEK:case D.MONTH:var E=I.toLocaleDateString();
break;
case D.YEAR:case D.DECADE:case D.CENTURY:case D.MILLENNIUM:var E=I.getUTCFullYear();
break;
}if(F>0){A.push({x:F,label:E});
}D.incrementByInterval(I,G,this._timeZone);
}while(I.getTime()<this._latestDate.getTime());
return A;
},_updateMappedValues:function(){if(this._latestDate&&this._earliestDate){this._period=this._latestDate.getTime()-this._earliestDate.getTime();
this._mappedPeriod=this._map.direct(this._period);
}else{this._period=0;
this._mappedPeriod=0;
}}};
Timeplot.MagnifyingTimeGeometry=function(B){Timeplot.DefaultTimeGeometry.apply(this,arguments);
var A=this;
this._MagnifyingMap={direct:function(D){if(D<A._leftTimeMargin){var C=D*A._leftRate;
}else{if(A._leftTimeMargin<D&&D<A._rightTimeMargin){var C=D*A._expandedRate+A._expandedTimeTranslation;
}else{var C=D*A._rightRate+A._rightTimeTranslation;
}}return C;
},inverse:function(C){if(C<A._leftScreenMargin){var D=C/A._leftRate;
}else{if(A._leftScreenMargin<C&&C<A._rightScreenMargin){var D=C/A._expandedRate+A._expandedScreenTranslation;
}else{var D=C/A._rightRate+A._rightScreenTranslation;
}}return D;
}};
this._mode="lin";
this._map=this._linMap;
};
Object.extend(Timeplot.MagnifyingTimeGeometry.prototype,Timeplot.DefaultTimeGeometry.prototype);
Timeplot.MagnifyingTimeGeometry.prototype.initialize=function(F){Timeplot.DefaultTimeGeometry.prototype.initialize.apply(this,arguments);
if(!this._lens){this._lens=this._timeplot.putDiv("lens","timeplot-lens");
}var G=1000*60*60*24*30;
var H=this;
var B=function(K){var M=K.clientWidth;
var L=H._timeplot.locate(K);
H.setMagnifyingParams(L.x+M/2,M,G);
H.actMagnifying();
H._timeplot.paint();
};
var J=function(L,K,M){H._canvas.startCoords=SimileAjax.DOM.getEventRelativeCoordinates(K,L);
H._canvas.pressed=true;
};
var I=function(L,K,N){H._canvas.pressed=false;
var M=SimileAjax.DOM.getEventRelativeCoordinates(K,L);
if(Timeplot.Math.isClose(M,H._canvas.startCoords,5)){H._lens.style.display="none";
H.actLinear();
H._timeplot.paint();
}else{H._lens.style.cursor="move";
B(H._lens);
}};
var D=function(L,K,N){if(H._canvas.pressed){var M=SimileAjax.DOM.getEventRelativeCoordinates(K,L);
if(M.x<0){M.x=0;
}if(M.x>H._canvas.width){M.x=H._canvas.width;
}H._timeplot.placeDiv(H._lens,{left:H._canvas.startCoords.x,width:M.x-H._canvas.startCoords.x,bottom:0,height:H._canvas.height,display:"block"});
}};
var A=function(L,K,M){H._lens.startCoords=SimileAjax.DOM.getEventRelativeCoordinates(K,L);
H._lens.pressed=true;
};
var C=function(L,K,M){H._lens.pressed=false;
};
var E=function(M,K,P){if(H._lens.pressed){var N=SimileAjax.DOM.getEventRelativeCoordinates(K,M);
var L=H._lens;
var O=L.offsetLeft+N.x-L.startCoords.x;
if(O<H._timeplot._paddingX){O=H._timeplot._paddingX;
}if(O+L.clientWidth>H._canvas.width-H._timeplot._paddingX){O=H._canvas.width-L.clientWidth+H._timeplot._paddingX;
}L.style.left=O;
B(L);
}};
if(!this._canvas.instrumented){SimileAjax.DOM.registerEvent(this._canvas,"mousedown",J);
SimileAjax.DOM.registerEvent(this._canvas,"mousemove",D);
SimileAjax.DOM.registerEvent(this._canvas,"mouseup",I);
SimileAjax.DOM.registerEvent(this._canvas,"mouseup",C);
this._canvas.instrumented=true;
}if(!this._lens.instrumented){SimileAjax.DOM.registerEvent(this._lens,"mousedown",A);
SimileAjax.DOM.registerEvent(this._lens,"mousemove",E);
SimileAjax.DOM.registerEvent(this._lens,"mouseup",C);
SimileAjax.DOM.registerEvent(this._lens,"mouseup",I);
this._lens.instrumented=true;
}};
Timeplot.MagnifyingTimeGeometry.prototype.setMagnifyingParams=function(F,C,A){C=C/2;
A=A/2;
var B=this._canvas.width;
var E=this._period;
if(F<0){F=0;
}if(F>B){F=B;
}if(F-C<0){C=F;
}if(F+C>B){C=B-F;
}var D=this.fromScreen(F)-this._earliestDate.getTime();
if(D-A<0){A=D;
}if(D+A>E){A=E-D;
}this._centerX=F;
this._centerTime=D;
this._aperture=C;
this._aperturePeriod=A;
this._leftScreenMargin=this._centerX-this._aperture;
this._rightScreenMargin=this._centerX+this._aperture;
this._leftTimeMargin=this._centerTime-this._aperturePeriod;
this._rightTimeMargin=this._centerTime+this._aperturePeriod;
this._leftRate=(F-C)/(D-A);
this._expandedRate=C/A;
this._rightRate=(B-F-C)/(E-D-A);
this._expandedTimeTranslation=this._centerX-this._centerTime*this._expandedRate;
this._expandedScreenTranslation=this._centerTime-this._centerX/this._expandedRate;
this._rightTimeTranslation=(F+C)-(D+A)*this._rightRate;
this._rightScreenTranslation=(D+A)-(F+C)/this._rightRate;
this._updateMappedValues();
};
Timeplot.MagnifyingTimeGeometry.prototype.actLinear=function(){this._mode="lin";
this._map=this._linMap;
this.reset();
};
Timeplot.MagnifyingTimeGeometry.prototype.actMagnifying=function(){this._mode="Magnifying";
this._map=this._MagnifyingMap;
this.reset();
};
Timeplot.MagnifyingTimeGeometry.prototype.toggle=function(){if(this._mode=="Magnifying"){this.actLinear();
}else{this.actMagnifying();
}};


/* color.js */
Timeplot.Color=function(A){this._fromHex(A);
};
Timeplot.Color.prototype={set:function(D,C,A,B){this.r=D;
this.g=C;
this.b=A;
this.a=(B)?B:1;
return this.check();
},transparency:function(A){this.a=A;
return this.check();
},lighten:function(B){var A=new Timeplot.Color();
return A.set(this.r+=parseInt(B,10),this.g+=parseInt(B,10),this.b+=parseInt(B,10));
},darken:function(B){var A=new Timeplot.Color();
return A.set(this.r-=parseInt(B,10),this.g-=parseInt(B,10),this.b-=parseInt(B,10));
},check:function(){if(this.r>255){this.r=255;
}else{if(this.r<0){this.r=0;
}}if(this.g>255){this.g=255;
}else{if(this.g<0){this.g=0;
}}if(this.b>255){this.b=255;
}else{if(this.b<0){this.b=0;
}}if(this.a>1){this.a=1;
}else{if(this.a<0){this.a=0;
}}return this;
},toString:function(B){var A=(B)?B:((this.a)?this.a:1);
return"rgba("+this.r+","+this.g+","+this.b+","+A+")";
},toHexString:function(){return"#"+this._toHex(this.r)+this._toHex(this.g)+this._toHex(this.b);
},_fromHex:function(A){if(/^#?([\da-f]{3}|[\da-f]{6})$/i.test(A)){A=A.replace(/^#/,"").replace(/^([\da-f])([\da-f])([\da-f])$/i,"$1$1$2$2$3$3");
this.r=parseInt(A.substr(0,2),16);
this.g=parseInt(A.substr(2,2),16);
this.b=parseInt(A.substr(4,2),16);
}else{if(/^rgb *\( *\d{0,3} *, *\d{0,3} *, *\d{0,3} *\)$/i.test(A)){A=A.match(/^rgb *\( *(\d{0,3}) *, *(\d{0,3}) *, *(\d{0,3}) *\)$/i);
this.r=parseInt(A[1],10);
this.g=parseInt(A[2],10);
this.b=parseInt(A[3],10);
}}this.a=1;
return this.check();
},_toHex:function(D){var C="0123456789ABCDEF";
if(D<0){return"00";
}if(D>255){return"FF";
}var B=Math.floor(D/16);
var A=D%16;
return C.charAt(B)+C.charAt(A);
}};


/* math.js */
Timeplot.Math={range:function(G){var D=G.length;
var C=Number.MAX_VALUE;
var A=Number.MIN_VALUE;
for(var B=0;
B<D;
B++){var E=G[B];
if(E<C){C=E;
}if(E>A){A=E;
}}
if (A == Number.MIN_VALUE) A = 0;
return{min:C,max:A};
},movingAverage:function(H,C){var E=H.length;
var D=new Array(E);
for(var I=0;
I<E;
I++){var G=0;
for(var A=I-C;
A<I+C;
A++){if(A<0){var B=H[0];
}else{if(A>=E){var B=D[I-1];
}else{var B=H[A];
}}G+=B;
}D[I]=G/(2*C);
}return D;
},integral:function(E){var D=E.length;
var C=new Array(D);
var B=0;
for(var A=0;
A<D;
A++){B+=E[A];
C[A]=B;
}return C;
},normalize:function(D){var C=D.length;
var B=0;
for(var A=0;
A<C;
A++){B+=D[A];
}for(var A=0;
A<C;
A++){D[A]/=B;
}return D;
},convolution:function(H,E){var M=H.length;
var L=E.length;
var I=new Array(M);
for(var C=0;
C<M;
C++){var A=0;
var D=(C+L<M)?C+L:M;
for(var B=C;
B<D;
B++){var K=H[B-L];
var J=E[B-C];
A+=K*J;
}I[C]=A;
}return I;
},heavyside:function(B){var D=new Array(B);
var C=1/B;
for(var A=0;
A<B;
A++){D[A]=C;
}return D;
},gaussian:function(size,threshold){with(Math){var radius=size/2;
var variance=radius*radius/log(threshold);
var g=new Array(size);
for(var t=0;
t<size;
t++){var l=t-radius;
g[t]=exp(-variance*l*l);
}}return this.normalize(g);
},round:function(x,n){with(Math){if(abs(x)>1){var l=floor(log(x)/log(10));
var d=round(exp((l-n+1)*log(10)));
var y=round(round(x/d)*d);
return y;
}else{log("FIXME(SM): still to implement for 0 < abs(x) < 1");
return x;
}}},tanh:function(A){if(A>5){return 1;
}else{if(A<5){return -1;
}else{var B=Math.exp(2*A);
return(B-1)/(B+1);
}}},isClose:function(B,A,C){return(B&&A&&Math.abs(B.x-A.x)<C&&Math.abs(B.y-A.y)<C);
}};


/* processor.js */
Timeplot.Operator={sum:function(A,B){return Timeplot.Math.integral(A.values);
},average:function(C,D){var B=("size" in D)?D.size:30;
var A=Timeplot.Math.movingAverage(C.values,B);
return A;
}};
Timeplot.Processor=function(D,A,C){this._dataSource=D;
this._operator=A;
this._params=C;
this._data={times:new Array(),values:new Array()};
this._range={earliestDate:null,latestDate:null,min:0,max:0};
var B=this;
this._processingListener={onAddMany:function(){B._process();
},onClear:function(){B._clear();
}};
this.addListener(this._processingListener);
};
Timeplot.Processor.prototype={_clear:function(){this.removeListener(this._processingListener);
this._dataSource._clear();
},_process:function(){var D=this._dataSource.getData();
var A=this._dataSource.getRange();
var B=this._operator(D,this._params);
var C=Timeplot.Math.range(B);
this._data={times:D.times,values:B};
this._range={earliestDate:A.earliestDate,latestDate:A.latestDate,min:C.min,max:C.max};
},getRange:function(){return this._range;
},getData:function(){return this._data;
},getValue:Timeplot.DataSource.prototype.getValue,addListener:function(A){this._dataSource.addListener(A);
},removeListener:function(A){this._dataSource.removeListener(A);
}};

