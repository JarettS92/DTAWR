function mainStarterTags() {
    let DTenv = getEnvironment($('#starter-tags-environment-select').val());
    console.log(DTenv);
    // dtrum.addActionProperties(action, null, null, {
    //     environment: DTenv['URL']
    // });
    // dtrum.sendSessionProperties(null, null, {
    //     environment: DTenv['URL']
    // });
    // dtrum.leaveAction(action);
    let serviceRule = {
        "name": "Service",
        "rules": [{
            "type": "SERVICE",
            "enabled": true,
            "valueFormat": "{Service:DetectedName}",
            "propagationTypes": [],
            "conditions": [{
                "key": {
                    "attribute": "SERVICE_DETECTED_NAME"
                },
                "comparisonInfo": {
                    "type": "STRING",
                    "operator": "EXISTS",
                    "value": null,
                    "negate": false,
                    "caseSensitive": null
                }
            }]
        }]
    }
    let processRule = {
        "name": "Process",
        "rules": [{
            "type": "PROCESS_GROUP",
            "enabled": true,
            "valueFormat": "{ProcessGroup:DetectedName}",
            "propagationTypes": [],
            "conditions": [{
                "key": {
                    "attribute": "PROCESS_GROUP_NAME"
                },
                "comparisonInfo": {
                    "type": "STRING",
                    "operator": "EXISTS",
                    "value": null,
                    "negate": false,
                    "caseSensitive": null
                }
            }]
        }]
    }
    let hostRule = {
        "name": "Host",
        "rules": [{
            "type": "HOST",
            "enabled": true,
            "valueFormat": "{Host:DetectedName}",
            "propagationTypes": [],
            "conditions": [{
                "key": {
                    "attribute": "HOST_NAME"
                },
                "comparisonInfo": {
                    "type": "STRING",
                    "operator": "EXISTS",
                    "value": null,
                    "negate": false,
                    "caseSensitive": null
                }
            }]
        }]
    }
    let databaseRule = {
        "name": "Database",
        "rules": [{
            "type": "SERVICE",
            "enabled": true,
            "valueFormat": null,
            "propagationTypes": [],
            "conditions": [{
                    "key": {
                        "attribute": "SERVICE_TYPE"
                    },
                    "comparisonInfo": {
                        "type": "SERVICE_TYPE",
                        "operator": "EQUALS",
                        "value": "DATABASE_SERVICE",
                        "negate": false
                    }
                },
                {
                    "key": {
                        "attribute": "SERVICE_DATABASE_NAME"
                    },
                    "comparisonInfo": {
                        "type": "STRING",
                        "operator": "EXISTS",
                        "value": null,
                        "negate": false,
                        "caseSensitive": null
                    }
                }
            ]
        }]
    }
    let IPRule = {
        "name": "IP",
        "rules": [{
            "type": "HOST",
            "enabled": true,
            "valueFormat": "{Host:IpAddress}",
            "propagationTypes": [
                "HOST_TO_PROCESS_GROUP_INSTANCE"
            ],
            "conditions": [{
                "key": {
                    "attribute": "HOST_IP_ADDRESS"
                },
                "comparisonInfo": {
                    "type": "IP_ADDRESS",
                    "operator": "EXISTS",
                    "value": null,
                    "negate": false,
                    "caseSensitive": null
                }
            }]
        }]
    }
    let settings = {
        "url": DTenv['URL'] + "/api/config/v1/autoTags",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Authorization": "Api-Token " + DTenv['TOK'],
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(serviceRule),
    };

    if ($('#starter-tags-service-checkbox').prop("checked")) {
        $.ajax(settings).done(function (response) {
            $('#starter-tags-tbody').append('<tr><td>Service:{Detected Name}</td><td>Successful</td></tr>');
        });
    } else {
        $('#starter-tags-tbody').append('<tr><td>Service:{Detected Name}</td><td>Skipped</td></tr>');
    }

    if ($('#starter-tags-process-checkbox').prop("checked")) {
        settings['data'] = JSON.stringify(processRule);
        $.ajax(settings).done(function (response) {
            $('#starter-tags-tbody').append('<tr><td>Process:{Detected Name}</td><td>Successful</td></tr>');
        });
    } else {
        $('#starter-tags-tbody').append('<tr><td>Process:{Detected Name}</td><td>Skipped</td></tr>');
    }

    if ($('#starter-tags-host-checkbox').prop("checked")) {
        settings['data'] = JSON.stringify(hostRule);
        $.ajax(settings).done(function (response) {
            console.log('testing some bullshit')
            $('#starter-tags-tbody').append('<tr><td>Host:{Detected Name}</td><td>Successful</td></tr>');
        });
    } else {
        $('#starter-tags-tbody').append('<tr><td>Host:{Detected Name}</td><td>Skipped</td></tr>');
    }

    if ($('#starter-tags-database-checkbox').prop("checked")) {
        settings['data'] = JSON.stringify(databaseRule);
        $.ajax(settings).done(function (response) {
            $('#starter-tags-tbody').append('<tr><td>Database:{Detected Name}</td><td>Successful</td></tr>');
        });
    } else {
        $('#starter-tags-tbody').append('<tr><td>Database:{Detected Name}</td><td>Skipped</td></tr>');
    }

    if ($('#starter-tags-ipaddress-checkbox').prop("checked")) {
        settings['data'] = JSON.stringify(IPRule);
        $.ajax(settings).done(function (response) {
            $('#starter-tags-tbody').append('<tr><td>IP:{HostIP}</td><td>Successful</td></tr>');
        });
    } else {
        $('#starter-tags-tbody').append('<tr><td>IP:{Detected Name}</td><td>Skipped</td></tr>');
    }
    // reset();
}