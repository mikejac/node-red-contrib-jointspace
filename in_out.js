/**
 * NodeRED jointSPACE
 * Copyright (C) 2019 Michael Jacobsen.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

module.exports = function(RED) {
    "use strict";

    const formats = require('./formatvalues');

    const validKeys = [
        "Back",
        "Find",
        "RedColour",
        "GreenColour",
        "YellowColour",
        "BlueColour",
        "Home",
        "VolumeUp",
        "VolumeDown",
        "Mute",
        "Options",
        "Dot",
        "Digit0",
        "Digit1",
        "Digit2",
        "Digit3",
        "Digit4",
        "Digit5",
        "Digit6",
        "Digit7",
        "Digit8",
        "Digit9",
        "Info",
        "CursorUp",
        "CursorDown",
        "CursorLeft",
        "CursorRight",
        "Confirm",
        "Next",
        "Previous",
        "Adjust",
        "WatchTV",
        "Viewmode",
        "Teletext",
        "Subtitle",
        "ChannelStepUp",
        "ChannelStepDown",
        "Source",
        "AmbilightOnOff",
        "PlayPause",
        "Pause",
        "FastForward",
        "Stop",
        "Rewind",
        "Record",
        "Online"      
    ];

    /******************************************************************************************************************
	 * 
	 *
	 */
    function jointSPACEGetNode(config) {
        RED.nodes.createNode(this, config);

        this.client     = config.client;
        this.clientConn = RED.nodes.getNode(this.client);
        this.topicDelim = '/';

        if (!this.clientConn) {
            this.error(RED._("in_out.errors.missing-config"));
            this.status({fill:"red", shape:"dot", text:"Missing config"});
            return;
        } else if (typeof this.clientConn.register !== 'function') {
            this.error(RED._("in_out.errors.missing-bridge"));
            this.status({fill:"red", shape:"dot", text:"Missing jointSPACE"});
            return;            
        }

        let node = this;

        /******************************************************************************************************************
         * called when power state is updated
         *
         */
        this.updated = function(state) {
            RED.log.debug("jointSPACEGetNode(updated): state = " + state);

            if (state) {
                node.status({fill:"yellow", shape:"dot", text:"Ready"});
            } else {
                node.status({fill:"red", shape:"dot", text:"Is off"});
            }
        }

        this.api = this.clientConn.register(this, 'get');

        this.status({fill:"yellow", shape:"dot", text:"Ready"});

        this.handleError = function(node, msg, err) {
            node.status({fill:"yellow", shape:"dot", text:"Error!"});
            RED.log.warn("jointSPACEGetNode: " + err);
            msg.payload = err;
        };

        /******************************************************************************************************************
         * respond to inputs from NodeRED
         *
         */
        this.on('input', function (msg) {
            RED.log.debug("jointSPACEGetNode(input)");

            let topicArr = msg.topic.split(node.topicDelim);
            let topic    = topicArr[topicArr.length - 1];   // get last part of topic

            RED.log.debug("jointSPACEGetNode(input): topic = " + topic);

            try {
                if (!node.clientConn.isOn()) {
                    node.status({fill:"red", shape:"dot", text:"Is off"});
                    RED.log.debug("jointSPACEGetNode(input): !isOn()");
                    msg.payload = null;

                    node.send(msg);
                } else if (topic.toUpperCase() === 'SOURCES') {
                    RED.log.debug("jointSPACEGetNode(input): SOURCES");

                    node.api.getSources(function (err, result) {
                        if (err) {
                            node.handleError(node, msg, err)
                        } else {
                            RED.log.debug("jointSPACEGetNode(input): result = " + JSON.stringify(result));                            
                            msg.payload = result;
                        }

                        node.send(msg);
                    });
                } else if (topic.toUpperCase() === 'CURRENTSOURCE') {
                    RED.log.debug("jointSPACEGetNode(input): CURRENTSOURCE");

                    node.api.getSourcesCurrent(function (err, result) {
                        if (err) {
                            node.handleError(node, msg, err)
                        } else {
                            RED.log.debug("jointSPACEGetNode(input): result = " + JSON.stringify(result));
                            
                            if (result.hasOwnProperty('id')) {
                                msg.payload = result.id;
                                RED.log.debug("jointSPACEGetNode(input): payload = " + msg.payload);
                            } else {
                                msg.payload = null;
                            }
                        }

                        node.send(msg);
                    });
                } else if (topic.toUpperCase() === 'SYSTEM') {
                    RED.log.debug("jointSPACEGetNode(input): SYSTEM");

                    node.api.getSystem(function (err, result) {
                        if (err) {
                            node.handleError(node, msg, err)
                        } else {
                            RED.log.debug("jointSPACEGetNode(input): result = " + JSON.stringify(result));

                            msg.payload = result;
                        }

                        node.send(msg);
                    });
                } else if (topic.toUpperCase() === 'SYSTEMCOUNTRY') {
                    RED.log.debug("jointSPACEGetNode(input): SYSTEMCOUNTRY");

                    node.api.getSystemCountry(function (err, result) {
                        if (err) {
                            node.handleError(node, msg, err)
                        } else {
                            RED.log.debug("jointSPACEGetNode(input): result = " + JSON.stringify(result));

                            if (result.hasOwnProperty('country')) {
                                msg.payload = result.country;
                                RED.log.debug("jointSPACEGetNode(input): payload = " + msg.payload);
                            } else {
                                msg.payload = null;
                            }
                        }

                        node.send(msg);
                    });
                } else if (topic.toUpperCase() === 'SYSTEMNAME') {
                    RED.log.debug("jointSPACEGetNode(input): SYSTEMNAME");

                    node.api.getSystemName(function (err, result) {
                        if (err) {
                            node.handleError(node, msg, err)
                        } else {
                            RED.log.debug("jointSPACEGetNode(input): result = " + JSON.stringify(result));

                            if (result.hasOwnProperty('name')) {
                                msg.payload = result.name;
                                RED.log.debug("jointSPACEGetNode(input): payload = " + msg.payload);
                            } else {
                                msg.payload = null;
                            }
                        }

                        node.send(msg);
                    });
                } else if (topic.toUpperCase() === 'SYSTEMMENULANGUAGE') {
                    RED.log.debug("jointSPACEGetNode(input): SYSTEMMENULANGUAGE");

                    node.api.getSystemMenulanguage(function (err, result) {
                        if (err) {
                            node.handleError(node, msg, err)
                        } else {
                            RED.log.debug("jointSPACEGetNode(input): result = " + JSON.stringify(result));

                            if (result.hasOwnProperty('menulanguage')) {
                                msg.payload = result.menulanguage;
                                RED.log.debug("jointSPACEGetNode(input): payload = " + msg.payload);
                            } else {
                                msg.payload = null;
                            }
                        }

                        node.send(msg);
                    });
                } else if (topic.toUpperCase() === 'SYSTEMMODEL') {
                    RED.log.debug("jointSPACEGetNode(input): SYSTEMMODEL");

                    node.api.getSystemModel(function (err, result) {
                        if (err) {
                            node.handleError(node, msg, err)
                        } else {
                            RED.log.debug("jointSPACEGetNode(input): result = " + JSON.stringify(result));

                            if (result.hasOwnProperty('model')) {
                                msg.payload = result.model;
                                RED.log.debug("jointSPACEGetNode(input): payload = " + msg.payload);
                            } else {
                                msg.payload = null;
                            }
                        }

                        node.send(msg);
                    });
                } else if (topic.toUpperCase() === 'SYSTEMSERIALNUMBER') {
                    RED.log.debug("jointSPACEGetNode(input): SYSTEMSERIALNUMBER");

                    node.api.getSystemSerialnumber(function (err, result) {
                        if (err) {
                            node.handleError(node, msg, err)
                        } else {
                            RED.log.debug("jointSPACEGetNode(input): result = " + JSON.stringify(result));

                            if (result.hasOwnProperty('serialnumber')) {
                                msg.payload = result.serialnumber;
                                RED.log.debug("jointSPACEGetNode(input): payload = " + msg.payload);
                            } else {
                                msg.payload = null;
                            }
                        }

                        node.send(msg);
                    });
                } else if (topic.toUpperCase() === 'SYSTEMSOFTWAREVERSION') {
                    RED.log.debug("jointSPACEGetNode(input): SYSTEMSOFTWAREVERSION");

                    node.api.getSystemSoftwareversion(function (err, result) {
                        if (err) {
                            node.handleError(node, msg, err)
                        } else {
                            RED.log.debug("jointSPACEGetNode(input): result = " + JSON.stringify(result));

                            if (result.hasOwnProperty('softwareversion')) {
                                msg.payload = result.softwareversion;
                                RED.log.debug("jointSPACEGetNode(input): payload = " + msg.payload);
                            } else {
                                msg.payload = null;
                            }
                        }

                        node.send(msg);
                    });
                } else {
                    RED.log.warn("jointSPACEGetNode: invalid topic '" + topic + "'");
                    return;
                }
            } catch (err) {
                RED.log.error(err);
            }
        });

        this.on('close', function(removed, done) {
            if (removed) {
                // this node has been deleted
                node.clientConn.remove(node, 'get');
            } else {
                // this node is being restarted
                node.clientConn.deregister(node, 'get');
            }
            
            done();
        });
    }

    RED.nodes.registerType("jointspace get", jointSPACEGetNode);

    /******************************************************************************************************************
	 * 
	 *
	 */
    function jointSPACESetNode(config) {
        RED.nodes.createNode(this, config);

        this.client     = config.client;
        this.clientConn = RED.nodes.getNode(this.client);
        this.topicDelim = '/';

        if (!this.clientConn) {
            this.error(RED._("in_out.errors.missing-config"));
            this.status({fill:"red", shape:"dot", text:"Missing config"});
            return;
        } else if (typeof this.clientConn.register !== 'function') {
            this.error(RED._("in_out.errors.missing-bridge"));
            this.status({fill:"red", shape:"dot", text:"Missing jointSPACE"});
            return;            
        }

        let node = this;

        /******************************************************************************************************************
         * called when power state is updated
         *
         */
        this.updated = function(state) {
            RED.log.debug("jointSPACESetNode(updated): state = " + state);

            if (state) {
                node.status({fill:"yellow", shape:"dot", text:"Ready"});
            } else {
                node.status({fill:"red", shape:"dot", text:"Is off"});
            }
        }

        this.api = this.clientConn.register(this, 'set');

        this.status({fill:"yellow", shape:"dot", text:"Ready"});

        this.handleError = function(node, msg, err) {
            node.status({fill:"yellow", shape:"dot", text:"Error!"});
            RED.log.warn("jointSPACESetNode: " + err);
            msg.payload = err;
        };
    
        /******************************************************************************************************************
         * respond to inputs from NodeRED
         *
         */
        this.on('input', function (msg) {
            RED.log.debug("jointSPACESetNode(input)");

            let topicArr = msg.topic.split(node.topicDelim);
            let topic    = topicArr[topicArr.length - 1];   // get last part of topic

            RED.log.debug("jointSPACESetNode(input): topic = " + topic);

            try {
                if (!node.clientConn.isOn()) {
                    node.status({fill:"red", shape:"dot", text:"Is off"});
                    RED.log.debug("jointSPACESetNode(input): !isOn()");
                    msg.payload = false;

                    node.send(msg);
                } else if (topic.toUpperCase() === 'CURRENTSOURCE') {
                    RED.log.debug("jointSPACESetNode(input): CURRENTSOURCE; payload = " + msg.payload);

                    node.api.postSourcesCurrent(msg.payload, function (err, result) {
                        RED.log.debug("jointSPACESetNode(input): CURRENTSOURCE; result = " + result);

                        if (err) {
                            node.handleError(node, msg, err)
                        } else {
                            node.status({fill:"green", shape:"dot", text:"CurrentSource: " + msg.payload});
                            msg.payload = true;
                        }

                        node.send(msg);
                    });
                } else {
                    RED.log.warn("jointSPACESetNode: invalid topic '" + topic + "'");
                    return;
                }
            } catch (err) {
                RED.log.error(err);
            }
        });

        this.on('close', function(removed, done) {
            if (removed) {
                // this node has been deleted
                node.clientConn.remove(node, 'set');
            } else {
                // this node is being restarted
                node.clientConn.deregister(node, 'set');
            }
            
            done();
        });
    }

    RED.nodes.registerType("jointspace set", jointSPACESetNode);

    /******************************************************************************************************************
	 * 
	 *
	 */
    function jointSPACEPowerNode(config) {
        RED.nodes.createNode(this, config);

        this.client     = config.client;
        this.clientConn = RED.nodes.getNode(this.client);
        this.topicDelim = '/';

        if (!this.clientConn) {
            this.error(RED._("in_out.errors.missing-config"));
            this.status({fill:"red", shape:"dot", text:"Missing config"});
            return;
        } else if (typeof this.clientConn.register !== 'function') {
            this.error(RED._("in_out.errors.missing-bridge"));
            this.status({fill:"red", shape:"dot", text:"Missing jointSPACE"});
            return;            
        }

        let node = this;

        /******************************************************************************************************************
         * called when power state is updated
         *
         */
        this.updated = function(state) {
            RED.log.debug("jointSPACEPowerNode(updated): state = " + state);

            if (state) {
                node.status({fill:"green", shape:"dot", text:"On"});
            } else {
                node.status({fill:"red", shape:"dot", text:"Off"});
            }

            let msg = {
                topic: "on",
                payload: state
            };

            node.send(msg);
        }

        this.api = this.clientConn.register(this, 'power');

        this.status({fill:"yellow", shape:"dot", text:"Ready"});

        /******************************************************************************************************************
         * respond to inputs from NodeRED
         *
         */
        this.on('input', function (msg) {
            RED.log.debug("jointSPACEPowerNode(input)");

            let topicArr = msg.topic.split(node.topicDelim);
            let topic    = topicArr[topicArr.length - 1];   // get last part of topic

            RED.log.debug("jointSPACEPowerNode(input): topic = " + topic);

            try {
                if (topic.toUpperCase() === 'ON') {
                    RED.log.debug("jointSPACEPowerNode(input): ON");

                    let on = formats.FormatValue(formats.Formats.BOOL, 'on', msg.payload);

                    RED.log.debug("jointSPACEPowerNode(input): ON; on = " + on);

                    if (on == true) {   // turn tv on
                        if (node.clientConn.isOn()) {   // already on
                            node.status({fill:"green", shape:"dot", text:"On"});
                            msg.payload = true;                            
                        } else {        // tv is off but user wants to turn it on: we can't do that over network :-(
                            node.status({fill:"red", shape:"dot", text:"Off"});
                            msg.payload = false;
                        }

                        node.send(msg);
                    } else {        // turn tv off
                        if (node.clientConn.isOn()) {
                            node.api.postInputKey("Standby", function (err, result) {
                                if (err) {
                                    node.status({fill:"yellow", shape:"dot", text:"Error!"});
                                    RED.log.warn("jointSPACEPowerNode: err = " + err);
                                    msg.payload = err;
                                } else {
                                    node.status({fill:"red", shape:"dot", text:"Off"});
                                    msg.payload = false;
                                }

                                node.send(msg);
                            });
                        } else {    // already off
                            node.status({fill:"red", shape:"dot", text:"Off"});
                            msg.payload = false;
                            node.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'GET') {
                    RED.log.debug("jointSPACEPowerNode(input): GET");

                    msg.payload = node.clientConn.isOn();
                    node.send(msg);
                }
            } catch (err) {
                RED.log.error(err);
            }
        });

        this.on('close', function(removed, done) {
            if (removed) {
                // this node has been deleted
                node.clientConn.remove(node, 'power');
            } else {
                // this node is being restarted
                node.clientConn.deregister(node, 'power');
            }
            
            done();
        });
    }

    RED.nodes.registerType("jointspace power", jointSPACEPowerNode);

    /******************************************************************************************************************
	 * 
	 *
	 */
    function jointSPACEKeyNode(config) {
        RED.nodes.createNode(this, config);

        this.client     = config.client;
        this.clientConn = RED.nodes.getNode(this.client);

        if (!this.clientConn) {
            this.error(RED._("in_out.errors.missing-config"));
            this.status({fill:"red", shape:"dot", text:"Missing config"});
            return;
        } else if (typeof this.clientConn.register !== 'function') {
            this.error(RED._("in_out.errors.missing-bridge"));
            this.status({fill:"red", shape:"dot", text:"Missing jointSPACE"});
            return;            
        }

        let node = this;

        /******************************************************************************************************************
         * called when power state is updated
         *
         */
        this.updated = function(state) {
            RED.log.debug("jointSPACEKeyNode(updated): state = " + state);

            if (state) {
                node.status({fill:"yellow", shape:"dot", text:"Ready"});
            } else {
                node.status({fill:"red", shape:"dot", text:"Is off"});
            }
        }

        this.api = this.clientConn.register(this, 'key');

        this.status({fill:"yellow", shape:"dot", text:"Ready"});

        /******************************************************************************************************************
         * respond to inputs from NodeRED
         *
         */
        this.on('input', function (msg) {
            RED.log.debug("jointSPACEKeyNode(input)");
            RED.log.debug("jointSPACEKeyNode(input): payload = " + msg.payload);

            try {
                if (validKeys.indexOf(msg.payload) > -1) {
                    RED.log.debug("jointSPACEKeyNode(input): key ok");

                    if (node.clientConn.isOn()) {
                        node.api.postInputKey(msg.payload, function (err, result) {
                            if (err) {
                                node.status({fill:"yellow", shape:"dot", text:"Error!"});
                                RED.log.warn("jointSPACEKeyNode: err = " + err);
                                msg.payload = false;
                            } else {
                                node.status({fill:"green", shape:"dot", text:"Ok"});
                                msg.payload = true;
                            }
                        });
                    } else {
                        node.status({fill:"red", shape:"dot", text:"Is off"});
                        msg.payload = false;
                    }

                    node.send(msg);
                } else {
                    RED.log.warn("jointSPACEKeyNode: invalid key '" + msg.payload + "'");
                }
            } catch (err) {
                RED.log.error(err);
            }
        });

        this.on('close', function(removed, done) {
            if (removed) {
                // this node has been deleted
                node.clientConn.remove(node, 'key');
            } else {
                // this node is being restarted
                node.clientConn.deregister(node, 'key');
            }
            
            done();
        });
    }

    RED.nodes.registerType("jointspace key", jointSPACEKeyNode);
}
