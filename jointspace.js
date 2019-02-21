/**
 * NodeRED Google jointSPACE
 * Copyright (C) 2018 Michael Jacobsen.
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

    const ambilight = require('ambilight');

    /******************************************************************************************************************
	 * 
	 *
	 */
    function jointSPACENode(config) {
        RED.nodes.createNode(this, config);

        //this.mgmtNodes = {};

        this.host       = config.host;
        this.timeout    = config.timeout;
        this.api        = new ambilight.AmbilightApi(this.host, this.timeout);

        var node = this;

        /******************************************************************************************************************
         * functions called by our 'clients'
         *
         */
        this.register = function(client, type) {
            RED.log.debug("jointSPACENode(): register; type = " + type);

            //let states = {};

            switch (type) {
                case 'in':
                    //states = node.app.NewLightOnOff(client, name);
                    break;

                case 'out':
                    //states = node.app.NewLightDimmable(client, name);
                    break;
            }

            return node.api;
        };

        this.deregister = function(client, type) {
            RED.log.debug("jointSPACENode(): deregister; type = " + type);

            /*if (type === 'mgmt' && node.mgmtNodes[client.id]) {
                delete node.mgmtNodes[client.id];
            }*/
        };

        this.remove = function(client, type) {
            RED.log.debug("jointSPACENode(): remove; type = " + type);

            /*if (type === 'mgmt' && node.mgmtNodes[client.id]) {
                delete node.mgmtNodes[client.id];
            } else {
                node.app.DeleteDevice(client);
            }*/
        };

        /*this.setState = function(client, state) {
            RED.log.debug("GoogleSmartHomeNode:setState(): state = " + JSON.stringify(state));
            node.app.SetState(client.id, state);
        };*/

        this.on('close', function(removed, done) {
            //node.app.Stop(done);
            
            if (removed) {
                // this node has been deleted
            } else {
                // this node is being restarted
                RED.log.debug("jointSPACENode(on-close): restarting");
            }
        });

        /******************************************************************************************************************
         * notifications coming from the application server
         *
         */
        /*this.app.on('server', function(state, param1) {
            RED.log.debug("GoogleSmartHomeNode(on-server): state  = " + state);
            RED.log.debug("GoogleSmartHomeNode(on-server): param1 = " + param1);

            node.callMgmtFuncs({
                _type: 'server',
                state: state,
                param1: param1
            });
        });*/

        /*this.app.on('actions-reportstate', function(msg) {
            RED.log.debug("GoogleSmartHomeNode(on-actions-reportstate): msg = " + JSON.stringify(msg));

            node.callMgmtFuncs({
                _type: 'actions-reportstate',
                msg: msg
            });
        });*/

        /*this.app.on('actions-requestsync', function(msg) {
            RED.log.debug("GoogleSmartHomeNode(on-actions-requestsync): msg = " + JSON.stringify(msg));

            node.callMgmtFuncs({
                _type: 'actions-requestsync',
                msg: msg
            });
        });*/

        /*this.app.on('/login', function(msg, username, password) {
            RED.log.debug("GoogleSmartHomeNode(on-login): msg      = " + msg);
            RED.log.debug("GoogleSmartHomeNode(on-login): username = " + username);
            RED.log.debug("GoogleSmartHomeNode(on-login): password = " + password);

            node.callMgmtFuncs({
                _type: 'login',
                msg: msg
            });
        });*/

        // call all management nodes
        /*this.callMgmtFuncs = function(obj) {
            Object.keys(node.mgmtNodes).forEach(function(key) {
                if (node.mgmtNodes.hasOwnProperty(key)) {
                    RED.log.debug("GoogleSmartHomeNode(on-server): found mgmt client");

                    node.mgmtNodes[key].updated(obj);
                }
            });
        };*/
    }

    RED.nodes.registerType("jointspace-client", jointSPACENode);
}