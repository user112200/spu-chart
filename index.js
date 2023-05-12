function fnGetDeviceData() {
    $.getJSON("./deviceList.json", function (data) {
        var dvclist = data.deviceList;
        dvclist.forEach(function (ele) {
            d3.select("image.device_" + ele.deviceIdx)
                .attr("xlink:href", function () {
                    var url = "./img/mapview_default.png";
                    if (ele.fuse_fault) {
                        url = "./img/mapview_gray.png";
                    } else if (!ele.dc_output) {
                        url = "./img/mapview_blue.png";
                    } else if (ele.under_protect) {
                        url = "./img/mapview_red.png";
                    } else if (ele.comm_fault) {
                        url = "./img/mapview_orange.png";
                    } else if (ele.GPS_InActive) {
                        url = "./img/mapview_yellow.png";
                    }
                    return url;
                });
        });
    });
}


function fnShowDeviceMap() {
    $.getJSON("./deviceMapView.json", function (data) {
        var jsonData = data;
        if (!jsonData.result || jsonData.result != "success") return;
        objList = {
            1: [],
            2: [],
            3: [],
            4: []
        }
        jsonData.list.forEach(function (ele, idx) {
            ele.json = JSON.parse(ele.objJson);
            objList[ele.layerIndex].push(ele);
        });
    });
    fnDrawMap();
}


function fnMakeStyle(style, value, unit) {
    if (value) {
        return style + " : " + value + (unit ? unit : "") + ";";
    } else return "";
}


function fnDrawMap() {
    $.getJSON("./deviceMapView.json", function (data) {
        var jsonData = data;
        if (!jsonData.result || jsonData.result != "success") return;
        var objList = {
            1: [],
            2: [],
            3: [],
            4: []
        }
        jsonData.list.forEach(function (ele, idx) {
            ele.json = JSON.parse(ele.objJson);
            objList[ele.layerIndex].push(ele);
        });

        for (var key in objList) {
            var list = objList[key];
            var layer = d3.select("#svg").select("#layer" + key);

            layer.selectAll("*").remove();
            var gObj = layer.selectAll("g.obj")
                .data(list, function (d) {
                    return d.objSeq;
                });
            gObj.exit().remove();

            gObj = gObj
                .enter()
                .append("g")
                .attr("id", function (d) {
                    return "obj" + d.objSeq;
                })
                .attr("class", "obj")
                .attr("transform", function (d) {
                    var x = 0,
                        y = 0;
                    if (d.objType == "CIRCLE") {
                        x = d.json.cx + d.json.r;
                        y = d.json.cy + d.json.r;
                    } else if (d.objType == "LINE") {
                        x = 0;
                        y = 0;
                    } else if (d.objType == "TEXT") {
                        x = d.json.x;
                        y = d.json.y;
                    } else if (d.objType == "DEVICE") {
                        x = d.json.x;
                        y = d.json.y;
                    }
                    return "translate(" + x + ", " + y + ")";
                })
                .each(function (d, i) {
                    var t = d3.select(this);
                    if (d.objType == "CIRCLE") {
                        t.append("circle")
                            .attr("cx", 0)
                            .attr("cy", 0)
                            .attr("r", d.json.r)
                            .attr("style", function (d2) {
                                var style = "";
                                style += fnMakeStyle("fill", d2.json.fill);
                                return style;
                            })
                            .attr("class", "objCircle")
                    } else if (d.objType == "LINE") {
                        t.append("line")
                            .attr("x1", d.json.x1)
                            .attr("y1", d.json.y1)
                            .attr("x2", d.json.x2)
                            .attr("y2", d.json.y2)
                            .attr("style", function (d2) {
                                var style = "";
                                style += fnMakeStyle("stroke-width", d2.json.strokeWidth);
                                style += fnMakeStyle("stroke", d2.json.stroke);
                                return style;
                            })
                            .attr("class", "objLine")
                    } else if (d.objType == "TEXT") {
                        t.append("text")
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("dy", "1em")
                            .attr("text-anchor", "start")
                            .attr("dominant-baseline", "top")
                            .attr("style", function (d2) {
                                var style = "";
                                style += fnMakeStyle("font-size", d2.json.fontSize, "px");
                                style += fnMakeStyle("font-family", d2.json.fontFamily);
                                style += fnMakeStyle("fill", d2.json.fill);
                                return style;
                            })
                            .text(d.json.text)
                    } else if (d.objType == "DEVICE") {
                        t.append("image")
                            .attr("xlink:href", function (d2) {
                                var url = "./img/mapview_default.png";
                                return url;
                            })
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("width", function (d2) {
                                return d2.json.width;
                            })
                            .attr("height", function (d2) {
                                return d2.json.height;
                            })
                            .on("contextmenu", function (d) {
                                selObjData = d;
                                $("#contextmenu").show();
                                $("#contextmenu").css("left", d.pageX + "px");
                                $("#contextmenu").css("top", d.pageY + "px");
                                d.preventDefault();
                            })
                            .on("click", function (d) {
                                $("#dvcDetailInfo").hide();
                                $("#dvcDetailInfo").css("left", d.pageX + "px");
                                $("#dvcDetailInfo").css("top", d.pageY + "px");
                                fnShowRectifier();
                            })
                            .attr("class", function (d2) {
                                return "device_" + d2.deviceIdx;
                            })
                    }
                })
                .merge(gObj);

            gObj
                .attr("transform", function (d) {
                    var x = 0,
                        y = 0;
                    if (d.objType == "CIRCLE") {
                        x = d.json.cx + d.json.r;
                        y = d.json.cy + d.json.r;
                    } else if (d.objType == "LINE") {
                        x = 0;
                        y = 0;
                    } else if (d.objType == "TEXT") {
                        x = d.json.x;
                        y = d.json.y;
                    } else if (d.objType == "DEVICE") {
                        x = d.json.x;
                        y = d.json.y;
                    }
                    return "translate(" + x + ", " + y + ")";
                })
                .each(function (d, i) {
                    if (d.objType == "CIRCLE") {
                        d3.select(this).selectAll("circle")
                            .attr("r", d.json.r)
                            .attr("style", function (d2) {
                                var style = "";
                                style += fnMakeStyle("fill", d2.json.fill);
                                return style;
                            })
                    } else if (d.objType == "LINE") {
                        d3.select(this).selectAll("line")
                            .attr("x1", d.json.x1)
                            .attr("y1", d.json.y1)
                            .attr("x2", d.json.x2)
                            .attr("y2", d.json.y2)
                            .attr("style", function (d2) {
                                var style = "";
                                style += fnMakeStyle("stroke-width", d2.json.strokeWidth);
                                style += fnMakeStyle("stroke", d2.json.stroke);
                                return style;
                            })
                    } else if (d.objType == "TEXT") {
                        d3.select(this).selectAll("text")
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("style", function (d2) {
                                var style = "";
                                style += fnMakeStyle("font-size", d2.json.fontSize, "px");
                                style += fnMakeStyle("font-family", d2.json.fontFamily);
                                style += fnMakeStyle("fill", d2.json.fill);
                                return style;
                            })
                            .text(d.json.text)
                    } else if (d.objType == "DEVICE") {
                        d3.select(this).selectAll("image")
                            .attr("xlink:href", function (d2) {
                                var url = "./img/mapview_default.png";
                                return url;
                            })
                            .attr("width", function (d2) {
                                return d2.json.width;
                            })
                            .attr("height", function (d2) {
                                return d2.json.height;
                            })
                            .attr("style", function (d2) {
                                if (d2.deviceIdx) {
                                    return "cursor:pointer";
                                } else return "";
                            })
                    }
                });
        }
    });
}


function fnShowRectifier(d) {
    $.getJSON("./deviceOne.json", function (data) {
        var device = data.device;

        html = "";
        if (device != null && device.length > 0) {
            var rectifierName = "Rectifier";
            if (device[0].company == "COM06") rectifierName = "배류기";
            html += '<button class="btn btn-mini fr mg-t10" onclick="$(\'#dvcDetailInfo\').hide();">Close</button>';
            html += '<h4>' + fnMsg("field.map.detail_info", "Detail Info") + '</h4>';

            html += '<div style="border-top: 1px solid black;padding:5px 0 5px 0;">' +
                '<table><tbody><tr><td>' + fnMsg("field.map.class", "Class") + '</td><td> : ' + rectifierName + '</td></tr><tr>' +
                '<td>' + fnMsg("field.map.tr_no", "TR No.") + '</td><td> : ' + device[0].deviceName + '</td></tr>';

            if (device[0].manufacture == null || device[0].manufacture == true) {
                html += '<td>' + fnMsg("field.tr_info.manufacture", "Manufacture") + '</td><td> : ' + (device[0].manufacture == null ? '-' : device[0].manufacture) + '</td></tr>';
            }

            html += '<td>' + fnMsg("field.map.structure", "Structure") + '</td><td> : ' + device[0].structure + '</td></tr>' +
                '</tbody></table></div>';

            html += '<div style="border-top: 1px solid black;padding:5px 0 5px 0; border-bottom: 1px solid black;"><table><tbody>' +
                '<tr><td>' + fnMsg("field.map.rated_volt", "Rated Volt") + '</td><td> : ' + device[0].ratedVolt + 'V</td></tr><tr>' +
                '<tr><td>' + fnMsg("field.map.rated_current", "Rated Current") + '</td><td> : ' + device[0].ratedCurrent + 'A</td></tr><tr>' +
                '<tr><td>' + fnMsg("field.map.oper_voltage", "Operation Voltage") + '</td><td> : ' + device[0].operVolt + 'V</td></tr><tr>' +
                '<tr><td>' + fnMsg("field.map.oper_current", "Operating Current") + '</td><td> : ' + device[0].operCurrent + 'A</td></tr><tr>' +
                '<tr class="' + (device[0].FuseFault == 'OFF' ? 'alarmColor' : '') +
                '"><td>' + fnMsg("field.map.fuse", "Fuse") + '</td><td> : ' + device[0].FuseFault + '</td></tr><tr>' +
                '<tr class="' + (device[0].TRDCOutput == 'OFF' ? 'alarmColor' : '') +
                '"><td>' + fnMsg("field.map.dc_output", "DC output") + '</td><td> : ' + device[0].TRDCOutput + '</td></tr><tr>' +
                '<tr><td>' + fnMsg("field.map.interrupt", "Interrupt") + '</td><td> : ' + device[0].Interrupt + '</td></tr><tr>'

                +
                '<tr class="' + (device[0].under_protect == 'ON' ? 'alarmColor' : '') +
                '"><td>' + fnMsg("field.map.under_protection", "Under Protection") + '</td><td> : ' + device[0].under_protect + '</td></tr><tr>' +
                '<tr style ="display:none" class="' + (device[0].over_protect == 'ON' ? 'alarmColor' : '') +
                '"><td>' + fnMsg("field.map.over_protection", "Over Protection") + '</td><td> : ' + device[0].over_protect + '</td></tr><tr>';

            if (device[0].acfault == null || device[0].acfault == true) {
                html += '<tr><td>' + fnMsg("field.map.ac_fault", "AC Fault") + '</td><td> : ' + device[0].ac_fault + '</td></tr><tr>';
            }

            html += '<tr class="' + (device[0].comm_fault == 'OFF' ? 'alarmColor' : '') +
                '"><td>' + fnMsg("field.map.comm", "Communication") + '</td><td> : ' + device[0].comm_fault + '</td></tr><tr>' +
                '<tr class="' + (device[0].GPS_InActive == 'OFF' ? 'alarmColor' : '') + '" ><td>' +
                fnMsg("field.map.gps", "GPS") + '</td><td> : ' + device[0].GPS_InActive + '</td></tr><tr>' +
                '</tbody></table></div>';

            html += '<h4>' + fnMsg("field.map.reference", "Reference") + '</h4>';

            for (var index in device) {
                var d = device[index];

                if (index == 0) {
                    html += '<div style="border-top: 1px solid black;padding:5px 0 5px 0; border-bottom: 1px solid black;"><table><tbody>';
                } else {
                    html += '<div style="border-bottom: 1px solid black;padding:5px 0 5px 0;"><table><tbody>';
                }

                html += '<tr><td>' + fnMsg("field.map.name", "Name") + '</td><td> : ' + d.Name + '</td></tr><tr>' +
                    '<tr><td>' + fnMsg("field.map.on_potential", "On Potential") + '</td><td> : ' + d.OnPotential + 'mV</td></tr><tr>' +
                    '<tr><td>' + fnMsg("field.map.type", "Type") + '</td><td> : ' + d.Type + '</td></tr><tr>' +
                    '</tbody></table></div>';
            }
        }

        $("#dvcDetailInfo").html(html);
        $("#dvcDetailInfo").show();
    });
}


function fnGoEdit() {
    if (selObjData == null) return;
    if (!selObjData.areaIdx || !selObjData.deviceIdx) return;
    var url = contextPath + "/manage/";
    url += "rectifierInfo?areaIdx=" + selObjData.areaIdx + "&deviceIdx=" + selObjData.deviceIdx;
    alert(url);
}

function fnGoStatus() {
    if (selObjData == null) return;
    if (!selObjData.areaIdx || !selObjData.deviceIdx) return;
    var url = contextPath + "/manage/";
    url += "rectifierCurrSatus?areaIdx=" + selObjData.areaIdx + "&deviceIdx=" + selObjData.deviceIdx;
    alert(url);
}

function fnGoTestResult() {
    if (selObjData == null) return;
    if (!selObjData.areaIdx || !selObjData.deviceIdx) return;
    var url = contextPath + "/manage/";
    url += "testResult?areaIdx=" + selObjData.areaIdx + "&deviceIdx=" + selObjData.deviceIdx;
    alert(url);
}


var selObjData = null;
fnDrawMap();
fnGetDeviceData();
d3.select("#bgCanvas")
    .on("click", function (d) {
        d.preventDefault();
        $("#contextmenu").hide();
        $("#dvcDetailInfo").hide();
    });