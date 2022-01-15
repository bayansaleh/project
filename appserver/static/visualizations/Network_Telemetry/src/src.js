(function (window) {
    var utils = {
        // color:rgb或rgba格式
        // opacity: 透明度
        calculateColor: function (color, opacity) {
            if (color.indexOf('#') === 0) {
                var color16 = color.slice(1);
                var r = parseInt(color16.slice(0, 2), 16);
                var g = parseInt(color16.slice(2, 4), 16);
                var b = parseInt(color16.slice(4), 16);
                return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
            } else if (/^rgb\(/.test(color)) {
                return color.replace(/rgb/, 'rgba').replace(')', ",") +
                    opacity + ')';
            } else {
                return color.split(',').splice(0, 3).join(',') +
                    opacity + ')';
            }
        }
    };
    var arrayUtils = {
        forEach: function (arr, cb, scope) {
            if (typeof Array.prototype.forEach === 'function') {
                arr.forEach(cb, scope);
            } else {
                for (var i = 0, len = arr.length; i < len; i++) {
                    cb.apply(scope, [arr[i], i, arr]);
                }
            }
        },
        map: function (arr, cb, scope) {
            if (typeof Array.prototype.map === 'function') {
                return arr.map(cb, scope);
            } else {
                var mapped = [];
                for (var i = 0, len = arr.length; i < len; i++) {
                    mapped[i] = cb.apply(scope, [arr[i], i, arr]);
                }
                return mapped;
            }
        }
    };

    var Marker = (function () {
        var M = function (options) {
            this.x = options.x;// بختفي السهم الثابت الي بالاخر 
            this.y = options.y;// بختفي السهم الثابت الي بالاخر 
            this.rotation = options.rotation;
            this.style = options.style;
            this.color = options.color;
            this.size = options.size;
            this.borderWidth = options.borderWidth;
            this.borderColor = options.borderColor;
        };

        M.prototype.draw = function (context) {
            context.save();
            context.translate(this.x, this.y);// ضرورية عشان مواقع الاسهم 
            context.rotate(this.rotation);

            context.lineWidth = this.borderWidth || 0;
            context.strokeStyle = this.borderColor || '#000';
            context.fillStyle = this.color || '#000';
            // 目前先只支持圆
            context.beginPath();
            if (this.style === 'circle') {
                context.arc(0, 0, this.size, 0, Math.PI * 2, false);
            } else if (this.style === 'arrow') {
                // 将箭头后退，让箭头的尖头指向终点
                context.moveTo(-this.size * 2, -this.size);
                context.lineTo(-this.size * 5 / 4, 0);
                context.lineTo(-this.size * 2, this.size);
                context.lineTo(0, 0);
                context.lineTo(-this.size * 2, -this.size);
            } // علاقة بالاسهم الثابت والمتحرك 
            context.closePath();
            context.stroke();
            context.fill();
            context.restore();
        };

        return M;
    })();

    var Arc = (function () {
        var A = function (options) {
            var startX = options.startX,
                startY = options.startY,
                endX = options.endX,
                endY = options.endY;
            //两点之间的圆有多个，通过两点及半径便可以定出两个圆，根据需要选取其中一个圆
            var L = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
            var m = (startX + endX) / 2; // 横轴中点
            var n = (startY + endY) / 2; // 纵轴中点
            var factor = 1.5;

            var centerX = (startY - endY) * factor + m;
            var centerY = (endX - startX) * factor + n;

            var radius = Math.sqrt(Math.pow(L / 2, 2) + Math.pow(L * factor, 2));
            var startAngle = Math.atan2(startY - centerY, startX - centerX);
            var endAngle = Math.atan2(endY - centerY, endX - centerX);

            // this.L = L;
            this.startX = startX;
            this.startY = startY;
            this.endX = endX;
            this.endY = endY;
            this.centerX = centerX;
            this.centerY = centerY;
            this.startAngle = startAngle;
            this.endAngle = endAngle;
            this.startLabel = options && options.labels && options.labels[0],
                this.endLabel = options && options.labels && options.labels[1],
                this.radius = radius;
            this.lineWidth = options.width || 1;
            this.strokeStyle = options.color || '#000';
            this.label = options.label;
            this.font = options.font;
            this.shadowBlur = options.shadowBlur;
            this.endAngle = endAngle - this.lineWidth / radius; // 让线后退，与箭头结合
            this.traffic = options.traffic;
            this.ips = options.ips;
        };

        A.prototype.draw = function (context) {
            context.save();
            context.lineWidth = this.lineWidth;
            context.strokeStyle = this.strokeStyle;
            context.shadowColor = this.strokeStyle;
            context.shadowBlur = this.shadowBlur || 2;

            context.beginPath();
            context.arc(this.centerX, this.centerY, this.radius, this.startAngle, this.endAngle, false);
            context.stroke();
            context.restore();

            context.save();
            context.fillStyle = this.strokeStyle;
            if (this.label) {
                context.font = this.font;
                if (this.startLabel) {
                    var x = this.startX - 15
                    var y = this.startY + 5
                    context.fillText(this.startLabel, x, y);
                }
                if (this.endLabel) {
                    var x = this.endX - 15;
                    var y = this.endY - 5;
                    context.fillText(this.endLabel, x, y);
                }
            }
            context.restore();
        };

        return A;
    })();

    var Pulse = (function () {
        function P(options) {
            this.x = options.x;
            this.y = options.y;
            this.maxRadius = options.radius;
            this.color = options.color;
            this.shadowBlur = 5;
            this.lineWidth = options.borderWidth;
            this.r = 0;
            this.factor = 2 / options.radius;
        };

        P.prototype.draw = function (context) {
            // var vr = (this.maxRadius - this.r) * this.factor;
            var vr = 0.5;
            this.r += vr;
            // this.shadowBlur = Math.floor(this.r);

            context.save();
            context.translate(this.x, this.y);
            var strokeColor = this.color;
            strokeColor = utils.calculateColor(strokeColor, 1 - this.r / this.maxRadius);
            context.strokeStyle = strokeColor;
            context.shadowBlur = this.shadowBlur;
            context.shadowColor = strokeColor;
            context.lineWidth = this.lineWidth;
            context.beginPath();
            context.arc(0, 0, this.r, 0, Math.PI * 2, false);
            context.stroke();
            context.restore();

            if (Math.abs(this.maxRadius - this.r) < 0.8) {
                this.r = 0;
            }
        }

        return P;
    })();

    var Spark = (function () {
        var S = function (options) {
            var startX = options.startX,
                startY = options.startY,
                endX = options.endX,
                endY = options.endY;

            //两点之间的圆有多个，通过两点及半径便可以定出两个圆，根据需要选取其中一个圆
            var L = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
            var m = (startX + endX) / 2; // 横轴中点
            var n = (startY + endY) / 2; // 纵轴中点
            var factor = 1.5;

            var centerX = (startY - endY) * factor + m;
            var centerY = (endX - startX) * factor + n;

            var radius = Math.sqrt(Math.pow(L / 2, 2) + Math.pow(L * factor, 2));
            var startAngle = Math.atan2(startY - centerY, startX - centerX);
            var endAngle = Math.atan2(endY - centerY, endX - centerX);

            // 保证Spark的弧度不超过Math.PI
            if (startAngle * endAngle < 0) {
                if (startAngle < 0) {
                    startAngle += Math.PI * 2;
                    endAngle += Math.PI * 2;
                } else {
                    endAngle += Math.PI * 2;
                }
            }

            this.tailPointsCount = 50; // 拖尾点数
            this.centerX = centerX;
            this.centerY = centerY;
            this.startAngle = startAngle;
            this.endAngle = endAngle;
            this.radius = radius;
            this.lineWidth = options.width || 1;
            this.strokeStyle = options.color || '#fff';
            this.factor = 2 / this.radius;
            this.deltaAngle = (80 / Math.min(this.radius, 400)) / this.tailPointsCount;
            this.trailAngle = this.startAngle;
            this.arcAngle = this.startAngle;

            this.animateBlur = true;

            const size = options.size ? options.size / 2 : 1
            this.marker = new Marker({
                x: 50,
                y: 80,
                rotation: 50 * Math.PI / 180,
                style: 'arrow',
                color: 'rgb(255, 255, 255)',
                size: size + 1,
                borderWidth: size,
                borderColor: this.strokeStyle
            });
        };

        S.prototype.drawArc = function (context, strokeColor, lineWidth, startAngle, endAngle) {
            context.save();
            context.lineWidth = lineWidth;
            // context.lineWidth = 5;
            context.strokeStyle = strokeColor;
            context.shadowColor = this.strokeStyle;
            // context.shadowBlur = 5;
            context.lineCap = "round";
            context.beginPath();
            context.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle, false);
            context.stroke();
            context.restore();
        };

        S.prototype.draw = function (context) {
            var endAngle = this.endAngle;
            // 匀速
            var angle = this.trailAngle + this.factor;
            var strokeColor = this.strokeStyle;
            if (this.animateBlur) {
                this.arcAngle = angle;
            }
            this.trailAngle = angle;
            strokeColor = utils.calculateColor(strokeColor, 0.1);

            this.drawArc(context, strokeColor, this.lineWidth, this.startAngle, this.arcAngle);

            // 拖尾效果
            var count = this.tailPointsCount;
            for (var i = 0; i < count; i++) {
                var arcColor = utils.calculateColor(this.strokeStyle, 0.3 - 0.3 / count * i);
                var tailLineWidth = 5;
                if (this.trailAngle - this.deltaAngle * i > this.startAngle) {
                    this.drawArc(context, arcColor,
                        tailLineWidth - tailLineWidth / count * i,
                        this.trailAngle - this.deltaAngle * i,
                        this.trailAngle
                    );
                }
            }

            context.save();
            context.translate(this.centerX, this.centerY);
            this.marker.x = Math.cos(this.trailAngle) * this.radius;
            this.marker.y = Math.sin(this.trailAngle) * this.radius;
            this.marker.rotation = this.trailAngle + Math.PI / 2;
            this.marker.draw(context);
            context.restore();

            if ((endAngle - this.trailAngle) * 180 / Math.PI < 0.5) {
                this.trailAngle = this.startAngle;
                this.animateBlur = false;
            }
        };

        return S;
    })();


    var Migration = (function () {
        var M = function (options) {
            this.data = options.data;
            this.store = {
                arcs: [],
                markers: [],
                pulses: [],
                sparks: []
            };
            this.playAnimation = true;
            this.started = false;
            this.context = options.context;
            this.style = options.style;
            this.init();
        };

        M.prototype.init = function () {
            this.updateData(this.data);
        };
        /*
         * Shape 必须拥有draw方法
        */
        M.prototype.add = function (Shape) {

        };
        M.prototype.remove = function () {

        };
        M.prototype.clear = function () {
            this.store = {
                arcs: [],
                markers: [],
                pulses: [],
                sparks: []
            };
            // 更新状态
            this.playAnimation = true;
            this.started = false;
            // 清除绘画实例，如果没有这个方法，多次调用start，相当于存在多个动画队列同时进行
            window.cancelAnimationFrame(this.requestAnimationId);
        };
        /*
         * 更新数据
        */
        M.prototype.updateData = function (data) {
            if (!data || data.length === 0) {
                return;
            }
            this.clear();
            this.data = data;
            if (this.data && this.data.length > 0) {
                arrayUtils.forEach(this.data, function (element) {
                    var arc = new Arc({
                        startX: element.from[0],
                        startY: element.from[1],
                        endX: element.to[0],
                        endY: element.to[1],
                        labels: element.labels,
                        label: this.style.arc.label,
                        font: this.style.arc.font,
                        width: element.arcWidth || this.style.arc.width,
                        color: element.color,
                        traffic: element.traffic,
                        ips: element.ips
                    });
                    var marker = new Marker({
                        x: element.to[0],
                        y: element.to[1],
                        rotation: arc.endAngle + Math.PI / 2,
                        style: 'arrow',
                        color: element.color,
                        size: element.arcWidth || this.style.arc.width + 3,
                        borderWidth: 0,
                        borderColor: element.color
                    });
                    var pulse = new Pulse({
                        x: element.to[0],
                        y: element.to[1],
                        radius: this.style.pulse.radius,
                        color: element.color,
                        borderWidth: this.style.pulse.borderWidth
                    });
                    var spark = new Spark({
                        startX: element.from[0],
                        startY: element.from[1],
                        endX: element.to[0],
                        endY: element.to[1],
                        width: 15,
                        color: element.color,
                        size: element.arcWidth
                    });

                    this.store.arcs.push(arc);
                    this.store.markers.push(marker);
                    this.store.pulses.push(pulse);
                    this.store.sparks.push(spark);
                }, this);
            }
        };
        /*
        */
        M.prototype.start = function (canvas) {
            var that = this;
            if (!this.started) {
                (function drawFrame() {
                    that.requestAnimationId = window.requestAnimationFrame(drawFrame, canvas);

                    if (that.playAnimation) {
                        canvas.width += 1;
                        canvas.width -= 1; //هون ما لاحظت تغيير , او ممكن بغير بعرض الاسهم بس كل مرة بعطي اشي 
                        for (var p in that.store) {
                            var shapes = that.store[p];
                            for (var i = 0, len = shapes.length; i < len; i++) {
                                shapes[i].draw(that.context);
                            } //اختفوا الاسهم بدون الفور 
                        }
                    }
                })();
                this.started = true;
            }
        }; // M.prototype.start = function (canvas)   اختفووا الاسهم بدونه
        M.prototype.play = function () {
            this.playAnimation = true;
        }; // ما اثر حذفه 
        M.prototype.pause = function () {
            this.playAnimation = false;
        }; // غير عرض الاسهم
        M.prototype.getData = function () {
            return this.store;
        }
        return M;
    })();

    L.MigrationLayer = L.Class.extend({
        options: {
            map: {}, // بغير بحجم الاسهم 
            data: {}, // nothing 
            pulseRadius: 25, // ولا اشي تغير 
            pulseBorderWidth: 3, // ولا اشي تغير 
            arcWidth: 1, // ما تغير اشي بس حذفتها
            arcLabel: true,
            arcLabelFont: '15px sans-serif', // nothing 
            Marker: {}, // nothing 
            Spark: {} // nothing 
            // بشكل عام بتغير حجم الاسهم كل مرة 
        },
        _setOptions: function (obj, options) {
            if (!obj.hasOwnProperty('options')) {
                obj.options = obj.options ? L.Util.create(obj.options) : {};
            } // الاف ما اثر حذفها 
            for (var i in options) {
                obj.options[i] = options[i];
            } // اذا انحذف الفور بختفوا الاسهم 
            return obj.options;
        },
        initialize: function (options) {
            this._setOptions(this, options);
            this._map = this.options.map || {}; // بختفوا الاسهم بدونها برضو 
            this._data = this.options.data || {}; // بختفوا الاسهم بدونها برضو 
            this._style = {
                pulse: {
                    radius: this.options.pulseRadius, //  هون بتحكم بالدائرة الي بتجيي باخر السهم اذا حذفناها بصير لون الدائرة اسود وبتضل تكبر 
                    borderWidth: this.options.pulseBorderWidth
                    // هون برضو بتتعلق بالدائرة بتعطي الدائرة لون اعمق (ظل)
                },
                arc: {
                    width: this.options.arcWidth,
                    label: this.options.arcLabel,
                    font: this.options.arcLabelFont
                } // هون مشان الاسهم بدونه بختفوا 
            } || {};
            this._show = true;
            this._init(); // بدونه بختفوا الاسهم بعملهم show 
        },
        _init: function () {
            var container = L.DomUtil.create('div', 'leaflet-ODLayer-container'); // بختفوا الاسهم
            container.style.position = 'absolute'; // ما بتاثر 
            container.style.width = this._map.getSize().x + "px"; // ما بتاثر 
            container.style.height = this._map.getSize().y + "px"; // ما بتاثر 

            this.container = container; // بختفوا الاسهم 

            this.canvas = document.createElement('canvas'); // بختفوا الاسهم 
            this.context = this.canvas.getContext('2d'); // بختفوا الاسهم 
            container.appendChild(this.canvas); // بختفوا الاسهم 
            //this._map.getPanes().overlayPane.appendChild(container);
            //this._resize();
            var that = this;
            if (!this.migration) {
                var data = this._convertData();
                this.migration = new Migration({
                    data: data,
                    context: this.context,
                    style: this._style
                });
                //this._draw();
                this._bindMapEvents();
            } //  بدون ال if  بختفوا الاسهم 
            this.canvas.addEventListener("click", function (event) {
                // reset the table
                var table = document.getElementById('.modal-body');
                var rowCount = table.rows.length;
                while (rowCount > '1') {
                    table.deleteRow(rowCount - 1);
                    rowCount--;
                }

                var mouse = that.onMousePos(that.canvas, event);
                var store = that.migration.getData();
                for (var p in store) {
                    var shapes = store[p];
                    for (var i = 0, len = shapes.length; i < len; i++) {
                        shapes[i].draw(that.context);
                        if (that.context.isPointInPath(mouse.x, mouse.y)) {
                            let row = table.insertRow();
                            let cell = row.insertCell();
                            cell.innerHTML = shapes[i].startLabel;
                            cell = row.insertCell();
                            cell.innerHTML = shapes[i].endLabel;

                            let srcIPs = (shapes[i].ips.split(":")[0]).split(",");
                            let destIPs = (shapes[i].ips.split(":")[1]).split(",");

                            for (let j = 0; j < srcIPs.length; j++) {
                                let ipRow = table.insertRow();
                                let ipCell = ipRow.insertCell();
                                ipCell.innerHTML = srcIPs[j];
                                ipCell = ipRow.insertCell();
                                ipCell.innerHTML = destIPs[j];
                            }

                            var modal = document.getElementById("myModal");
                            var span = document.getElementsByClassName("close")[0];

                            modal.style.display = "block";
                            span.onclick = function () {
                                modal.style.display = "none";
                            }

                            // When the user clicks anywhere outside of the modal, close it
                            window.onclick = function (event) {
                                if (event.target == modal) {
                                    modal.style.display = "none";
                                }
                            }
                        }
                    }
                }
            }, false);
        },
        onMousePos: function (canvas, evt) {
            var ClientRect = canvas.getBoundingClientRect();
            return {
                x: Math.round(evt.clientX - ClientRect.left),
                y: Math.round(evt.clientY - ClientRect.top)
            }
        },
        _resize: function () {
            var bounds = this._map.getBounds();
            var topleft = bounds.getNorthWest();
            var topLeftscreen = this._map.latLngToContainerPoint(topleft);
            //当地图缩放或者平移到整个地图的范围小于外层容器的范围的时候，要对this.container进行上下平移操作，反之则回归原位
            if (topLeftscreen.y > 0) {
                this.container.style.top = -topLeftscreen.y + 'px'; // تغير بعض الاسهم اذا ضفت  الرقم 
            } else {
                this.container.style.top = '0px'; // تغير بعض الاسهم اذا غيرت الرقم 
            }

            var containerStyle = window.getComputedStyle(this._map.getContainer());
            this.canvas.setAttribute('width', parseInt(containerStyle.width, 10)); //  بس غيرت الرقم وحطيت 100 قصروا الاسهم وبس حطيته 5 اختفوا 
            this.canvas.setAttribute('height', parseInt(containerStyle.height, 10)); // هون اختفى نص الاسهم بس غيرت الرقم وبس حطيته 7 اختفى نصهم 
        }, // resize: function () بختفوا الاسهم بدونه 
        // اقل من 10 ببلشوا يختفوا الاسهم حسب الرقم 
        _convertData: function () {
            var bounds = this._map.getBounds();
            let maxValue;
            let minValue
            if (this._data && bounds) {
                arrayUtils.forEach(this._data, function (d) {
                    if (d.value) {
                        if (!maxValue) {
                            maxValue = d.value;
                            minValue = d.value;
                        } // تغير حجم السهم الاصفر والبرتقالي بحذفها 
                        if (maxValue < d.value) {
                            maxValue = d.value;
                        } // تغير حجم الاحمر والاخضر الرابع والازرق 
                        if (minValue > d.value) {
                            minValue = d.value;
                        } // تغيرت الاسهم ما عدا الاحمر والبرتقالي والي رايح على oklahoma 
                    }
                });
                var maxWidth = this.options.maxWidth || 10; //nothing
                var data = arrayUtils.map(this._data, function (d) {
                    if (d.value) {
                        if (!maxValue) {
                            maxValue = d.value;
                            minValue = d.value;
                        } // تغير حجم الاسهم 
                        if (maxValue < d.value) {
                            maxValue = d.value;
                        } // تغير حجم الاسهم 
                        if (minValue > d.value) {
                            minValue = d.value;
                        } // تغير حجم الاسهم 
                    }

                    var fromPixel = this._map.latLngToContainerPoint(new L.LatLng(d.from[1], d.from[0]));
                    var toPixel = this._map.latLngToContainerPoint(new L.LatLng(d.to[1], d.to[0]));
                    // اذا غيرت رقم بختفوا الاسهم 
                    return {
                        from: [fromPixel.x, fromPixel.y],
                        to: [toPixel.x, toPixel.y],
                        labels: d.labels,
                        value: d.value,
                        color: d.color,
                        arcWidth: d.value ? parseInt((d.value - minValue) * (maxWidth - 1) / (maxValue - minValue)) + 1 : this.options.arcWidth,
                        traffic: d.traffic,
                        ips: d.ips
                    } // بختفوا الاسهم 
                }, this);

                return data;
            }
        },  //_convertData: function () بدونه بختفوا الاسهم 
        _bindMapEvents: function () {
            var that = this;
            // window.onresize = function () {
            //     that._resize();
            // };
            // this._map.on('movestart ', function () {
            //     that.migration.pause();
            // });
            if (!this._map.listens("moveend")) {
                this._map.on('moveend', function () {
                    that.migration.play();
                    that._draw();
                });
            } // تغير حجم الاسهم في اسهم كبر عرضها وفي قل 

            if (!this._map.listens('zoomstart')) {
                this._map.on('zoomstart ', function () { that.container.style.display = 'none' });
            } //تغير حجم الاسهم 

            if (!this._map.listens('zoomend')) {
                this._map.on('zoomend', function () {
                    if (that._show) {
                        that.container.style.display = ''
                        that._draw();
                    }
                });
            }

        }, //bindMapEvents: function () بدونه بحتفوا الاسهم 
        _draw: function () {
            var bounds = this._map.getBounds();
            if (bounds && this.migration.playAnimation) {
                this._resize();
                this._transform();
                var data = this._convertData();
                this.migration.updateData(data);
                this.migration.start(this.canvas);
            }
        },// بدون draw: function ()  غير حجم الاسهم 
        _transform: function () {
            var bounds = this._map.getBounds();
            var topLeft = this._map.latLngToLayerPoint(bounds.getNorthWest());
            L.DomUtil.setPosition(this.container, topLeft);
        }, //  transform: function () بدونه اختفوا الاسهم 
        addTo: function () {
            this._bindMapEvents(); //غيرت حجم الاسهم بس حذفتها 
            this._map.getPanes().overlayPane.appendChild(this.container);  // اختفوا الاسهم بس حذفتها 
            var bounds = this._map.getBounds();  // اختفوا الاسهم بس حذفتها 
            if (bounds && this.migration.playAnimation) {
                this._resize();
                this._transform();// اختفووا الاسهم بدونهم 

                var data = this._convertData(); // اختفوا الاسهم بس حذفتها 
                this.migration.updateData(data); //غيرت حجم الاسهم بس حذفتها 
                this.migration.start(this.canvas); // اختفوا الاسهم بس حذفتها 
            } // اختفوا الاسهم 
        },//  addTo: function () بدونه اختفوا الاسهم 


        setData: function (data) {
            this._data = data;
            this._draw();
        },
        hide: function () {
            this.container.style.display = 'none';
            this._show = false; // بعمل اخفاء للاسهم 
        },
        show: function () {
            this.container.style.display = '';
            this._show = true; // بعمل عرض لاسهم في حال اخفيتهم
        },
        play: function () {
            this.migration.play(); // بشغل الاسهم بعملها play زر
        },
        pause: function () {
            this.migration.pause(); // بوقف عمل الاسم زر
        },
        destroy: function () {
            this.migration.clear();
            //移除dom
            this.container.parentNode.removeChild(this.container);
            //移除事件监听
            //this._map.clearAllEventListeners();
            this.mapHandles = [];  // بس اكبس عليها بختفوا الاسهم وما برجعوا ولا باي زر
        },
        add1: function () {
            fetch("../data.json")
                .then(function (response) {
                    return response;
                })
                .then(function (data) {
                    return data.json();
                })
                .then(function (Normal) {
                    const html = Normal.map(
                        (data) => `<div class="card">
                        <h4> ${data.ip}</h4>
                        <h2> ${data.name} </</h2>
                        <h3> ${data.latitude}</h3>
                        <h3> ${data.longitude}</h3>
                        <h3> ${data.traffic}</h3>
                    </div>`
                    );
                    document.getElementById("debug").innerHTML = html;
                })
        }
    },
        function processProfileData(data) {
            let profileName = document.getElementById('ip');
            profileName.innerHTML = data.ip;
            let profileData = "../data.json";
            $.getJSON(profile, processProfileData);
        }
    );
    L.migrationLayer = function (options) {
        return new L.MigrationLayer(options)
    }
})(window)