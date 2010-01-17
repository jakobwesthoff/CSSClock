/**
 * Copyright 2010 Jakob Westhoff. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 *    1. Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *    2. Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY JAKOB WESTHOFF ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL JAKOB WESTHOFF OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * The views and conclusions contained in the software and documentation are those
 * of the authors and should not be interpreted as representing official policies,
 * either expressed or implied, of Jakob Westhoff
**/

(function(window, undefined){
    /**
     * A simple scope proxy creator taking an object and a function name from
     * inside the object as input and returning a proxy function calling the
     * specified object method with the scope set to the object.
     */
    var _p = function( scope, fname ) {
        var fn = scope[fname];
        var p = function() {
            return fn.apply( scope, arguments );
        }
        return p;
    }
    
    /**
     * CSSClock object handling all the controlling and creation stuff
     *
     * The options are completely optional. They include the following
     * settings:
     * backgroundImage, hoursImage, minutesImage, secondsImage, size, imagePath
     */
    var _c = window.CSSClock = function( container, options ) {
        options = options || {};

        // Initialize class properties
        this.backgroundImage = options.backgroundImage || "clock-background.png";
        this.hoursImage = options.hoursImage           || "clock-hours.png";
        this.minutesImage = options.minutesImage       || "clock-minutes.png";
        this.secondsImage = options.secondsImage       || "clock-seconds.png";
        this.size = options.size                       || 256;
        this.imagePath = options.imagePath             || "images";
        this.imagePath = this.imagePath + "/";

        this._initializeContainers( container )
        this._onTimeout();
        setInterval( _p( this, "_onTimeout" ), 1000 )
    }

    _c.prototype = {
        /**
         * Initialize all containers needed for displaying the clock inside the
         * given container element
         */
        _initializeContainers: function( container ) {
            this.backgroundContainer = this._createDivWithBackground( this.imagePath + this.backgroundImage, this.size );
            this.hoursContainer      = this._createDivWithBackground( this.imagePath + this.hoursImage, this.size );
            this.minutesContainer    = this._createDivWithBackground( this.imagePath + this.minutesImage, this.size );
            this.secondsContainer    = this._createDivWithBackground( this.imagePath + this.secondsImage, this.size );

            var relativizer = document.createElement( "div" );
            relativizer.style.position = "relative";

            var c = ["backgroundContainer", "hoursContainer", "minutesContainer", "secondsContainer"];
            for ( var k in c ) {
                this[c[k]].style.position = "absolute";
                this[c[k]].style.top = "0";
                this[c[k]].style.left = "0";
                relativizer.appendChild( this[c[k]] );
            }
            
            container.appendChild( relativizer );
        },

        /**
         * Called every time another second has passed and the clock needs to
         * be updated.
         */
        _onTimeout: function() {
            this._updateTime();
            return true; // Call again after one second.
        },

        /**
         * Set the correct rotation for every layer based on the current time 
         */
        _updateTime: function() {
            var t      = new Date();
            var hour   = t.getHours();
            var minute = t.getMinutes();
            var second = t.getSeconds();

            // We need a 12 hour scale to calculate the rotation easily
            // There will still be 0 and 12 hours but this does not make a
            // difference for the rotation calculation.
            hour = hour > 12 ? hour - 12 : hour;

            // 12 Hours a day on a 360° scale make 30° for every hour. We add
            // 0.5 degrees per minute to allow for smooth adaption. On the
            // other hand we only want 6 degree "jumps" because they represent
            // the markers.
            this._setRotation( this.hoursContainer, ( hour * 30 ) + minute * 0.5 - ( minute * 0.5 % 6 ) ); 

            // 60 minutes a hour on 360° scale make 6° for every minute.
            this._setRotation( this.minutesContainer, minute * 6 );

            // 60 seconds a minute on a 360° scale make 6° for every second.
            this._setRotation( this.secondsContainer, second * 6 );
        },

        /**
         * Create a div with a css property assigning the given background
         * image and setting the given with and height.
         *
         * Width and height values are supplied in pixel but WITHOUT the
         * measurement "px" appended.
         *
         * If only one measurement is given, than the div assumed to be
         * quadratic
         */
        _createDivWithBackground: function( background, width, height ) {
            height = height || width;
            var el = document.createElement( "div" );
            el.style.width = width.toString() + "px";
            el.style.height = height.toString() + "px";
            el.style.background = "transparent url( " + background + " ) top left no-repeat";
            
            return el;
        },

        /**
         * Set a rotation transformation on an arbitrary element
         */
        _setRotation: function( el, rotation ) {
            // This will remove any other transformations of the element and
            // replace them by a rotation. Even though this isn't nice it does
            // not affect the clock.
            el.style.transform       = "rotate(" + rotation.toString() + "deg)";
            el.style.MozTransform    = "rotate(" + rotation.toString() + "deg)";
            el.style.WebkitTransform = "rotate(" + rotation.toString() + "deg)";
        }
    }
 
})( window );
