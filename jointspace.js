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
 */

module.exports = function(RED) {
    "use strict";

    const ambilight = require('./lib/index');
    const spawn     = require('child_process').spawn;
    const plat      = require('os').platform();

    /******************************************************************************************************************
	 * 
	 *
	 */
    function jointSPACENode(config) {
        RED.nodes.createNode(this, config);

        this.clients        = {};
        this.pingInterval   = 3 * 1000;
        this._isOn          = -1;
        this.host           = config.host;
        this.timeout        = parseInt(config.timeout, 10);
        this.api            = new ambilight.AmbilightApi(this.host, this.timeout);

        var node = this;

        /******************************************************************************************************************
         * ping
         * https://github.com/node-red/node-red-nodes/blob/master/io/ping/88-ping.js
         */
        node.pinger = setInterval(function() {
            var ex;

            if (plat == "linux" || plat == "android") {
                ex = spawn('ping', ['-n', '-w', '5', '-c', '1', node.host]); 
            } else if (plat.match(/^win/)) { 
                ex = spawn('ping', ['-n', '1', '-w', '5000', node.host]); 
            } else if (plat == "darwin" || plat == "freebsd") { 
                ex = spawn('ping', ['-n', '-t', '5', '-c', '1', node.host]); 
            } else { 
                RED.log.error("Sorry - your platform - " + plat + " - is not recognised."); 
            }

            var fail  = false;

            ex.stdout.on('data', function (data) {
                //RED.log.debug("jointSPACENode(pinger/data): data = " + data);
            });

            ex.on('error', function (err) {
                fail = true;
                if (err.code === "ENOENT") {
                    RED.log.error(err.code + " ping command not found");
                } else if (err.code === "EACCES") {
                    RED.log.error(err.code + " can't run ping command");
                } else {
                    RED.log.error(err.code);
                }
            });
        
            ex.on('close', function (code) {
                if (fail) { 
                    fail = false; 
                    return; 
                }

                if (code === 0) {
                    if (node._isOn != 1) {
                        RED.log.debug("jointSPACENode(pinger): On");
                        node._isOn = 1;

                        Object.keys(node.clients).forEach(function(k, i) {
                            node.clients[k].updated(true);
                        });
                    }
                } else {
                    if (node._isOn != 0) {
                        RED.log.debug("jointSPACENode(pinger): Off");
                        node._isOn = 0;

                        Object.keys(node.clients).forEach(function(k, i) {
                            node.clients[k].updated(false);
                        });
                    }
                }
            });
        }, node.pingInterval);

        /******************************************************************************************************************
         * functions called by our 'clients'
         *
         */
        this.register = function(client, type) {
            RED.log.debug("jointSPACENode(): register; type = " + type);

            node.clients[client.id] = client;
            return node.api;
        };

        this.deregister = function(client, type) {
            RED.log.debug("jointSPACENode(): deregister; type = " + type);

            delete node.clients[client.id];
        };

        this.remove = function(client, type) {
            RED.log.debug("jointSPACENode(): remove; type = " + type);

            delete node.clients[client.id];
        };

        this.isOn = function() {
            if (node._isOn == 1) {
                return true;
            } else {
                return false;
            }
        };

        this.on('close', function(removed, done) {
            if (removed) {
                // this node has been deleted
            } else {
                // this node is being restarted
                RED.log.debug("jointSPACENode(on-close): restarting");
            }

            done();
        });
    }

    RED.nodes.registerType("jointspace-client", jointSPACENode);
}